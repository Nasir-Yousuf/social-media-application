package com.clearfeed.mesh

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.CopyOnWriteArraySet
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Clearfeed Android Native BLE Mesh Transport Service (CFM1 Specification)
 * 
 * Implements real physical Bluetooth Low Energy transport:
 * - Service UUID: 0000CFM1-0000-1000-8000-00805F9B34FB
 * - TX_RX_FRAME_CHAR: 0000CFM2-0000-1000-8000-00805F9B34FB (Write, WriteNoResp, Notify, CCCD 0x2902)
 * - PEER_IDENTITY_CHAR: 0000CFM3-0000-1000-8000-00805F9B34FB (Read compact beacon)
 * - Dual-Role: Simultaneously operates BLE Peripheral (GATT Server + Advertiser) + BLE Central (Scanner + Client)
 * - Hardware ScanFilter offload for background screen-off scanning
 * - Explicit MTU negotiation (requestMtu(512)) and serialized chunk write queue
 */
class BleMeshService(private val context: Context) {

    companion object {
        private const val TAG = "CFM1_BleMesh"

        // Canonical CFM1 128-bit UUIDs
        val SERVICE_UUID: UUID = UUID.fromString("0000CFM1-0000-1000-8000-00805F9B34FB")
        val TX_RX_FRAME_CHAR_UUID: UUID = UUID.fromString("0000CFM2-0000-1000-8000-00805F9B34FB")
        val PEER_IDENTITY_CHAR_UUID: UUID = UUID.fromString("0000CFM3-0000-1000-8000-00805F9B34FB")
        val CCCD_DESCRIPTOR_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

        const val DEFAULT_ATT_MTU = 23
        const val SAFE_MIN_PAYLOAD = 20
        const val TARGET_MTU = 512
        const val FRAGMENT_HEADER_SIZE = 6
        const val INTER_PACKET_PACE_MS = 15L
        const val SCAN_DUTY_CYCLE_ACTIVE_MS = 10000L
        const val SCAN_DUTY_CYCLE_PAUSE_MS = 5000L
    }

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    // Peripheral Role (GATT Server + Advertising)
    private var gattServer: BluetoothGattServer? = null
    private var txRxServerChar: BluetoothGattCharacteristic? = null
    private var peerIdentityServerChar: BluetoothGattCharacteristic? = null
    private val serverConnectedDevices = CopyOnWriteArraySet<BluetoothDevice>()
    private var advertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    // Central Role (Scanner + Connected Peers)
    private var scanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private val connectedPeers = ConcurrentHashMap<String, BluetoothGatt>()
    private val peerNegotiatedMtu = ConcurrentHashMap<String, Int>()
    private val peerRssiMap = ConcurrentHashMap<String, Int>()
    private val peerTruncatedPubkeyMap = ConcurrentHashMap<String, String>()

    // Serialized transmission queue
    private var sendExecutor = Executors.newSingleThreadExecutor()
    private val isWriting = AtomicBoolean(false)
    private val mainHandler = Handler(Looper.getMainLooper())

    // 3-Tier Adaptive Battery-Efficient Scan Scheduler:
    // Tier 1 (Active Mesh Screen): SCAN_MODE_LOW_LATENCY (5s scan / 2s pause)
    // Tier 2 (Foreground / Recent <5min): SCAN_MODE_BALANCED (3s scan / 12s pause)
    // Tier 3 (Background or Battery <20%): SCAN_MODE_LOW_POWER (2s scan / 28s pause)
    enum class ScanTier(val scanMode: Int, val scanActiveMs: Long, val scanPauseMs: Long) {
        ACTIVE_MESH(ScanSettings.SCAN_MODE_LOW_LATENCY, 5000L, 2000L),
        FOREGROUND(ScanSettings.SCAN_MODE_BALANCED, 3000L, 12000L),
        BACKGROUND_LOW_POWER(ScanSettings.SCAN_MODE_LOW_POWER, 2000L, 28000L)
    }

    private var currentScanTier: ScanTier = ScanTier.FOREGROUND
    private var dutyCycleHandler: Handler? = null
    private var isDutyCycleScanning = false

    // Node Identity & Beacon
    private var localNodeId: String = ""
    private var localTruncatedPubkey: ByteArray = ByteArray(8)
    private var localSyncHash: ByteArray = ByteArray(4)
    private var isRunning: Boolean = false

    // Event Listeners (Bridge to React Native / Expo)
    var onPeerDiscovered: ((peerId: String, peerAddress: String, rssi: Int, nickname: String, mtu: Int, truncatedPubkey: String) -> Unit)? = null
    var onPeerLost: ((peerId: String) -> Unit)? = null
    var onChunkReceived: ((peerId: String, chunkHex: String, frameShortId: Int, fragIdx: Int, totalFrags: Int) -> Unit)? = null
    var onNeighborWriteComplete: ((peerId: String, success: Boolean, bytesWritten: Int) -> Unit)? = null
    var onTransportStateChanged: ((isScanning: Boolean, isAdvertising: Boolean, connectedPeerCount: Int, defaultMtu: Int) -> Unit)? = null
    var onLegacyPacketReceived: ((rawString: String) -> Unit)? = null

    /**
     * Start the CFM1 BLE Transport Engine
     */
    fun start(nodeId: String, truncatedPubkeyHex: String = "", syncHashHex: String = ""): Boolean {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w(TAG, "Bluetooth adapter is disabled or unavailable")
            return false
        }

        localNodeId = nodeId
        localTruncatedPubkey = parseOrPadBytes(truncatedPubkeyHex, 8)
        localSyncHash = parseOrPadBytes(syncHashHex, 4)

        isRunning = true
        if (sendExecutor.isShutdown) {
            sendExecutor = Executors.newSingleThreadExecutor()
        }

        startGattServer()
        startAdvertising()
        startDutyCycledScanning()

        notifyTransportState()
        Log.i(TAG, "CFM1 Native BLE Mesh engine started successfully for node: $nodeId")
        return true
    }

    /**
     * Stop the CFM1 BLE Transport Engine
     */
    fun stop() {
        isRunning = false
        stopDutyCycledScanning()
        stopAdvertising()
        stopGattServer()

        for (gatt in connectedPeers.values) {
            try {
                gatt.disconnect()
                gatt.close()
            } catch (e: Exception) {}
        }
        connectedPeers.clear()
        serverConnectedDevices.clear()
        peerNegotiatedMtu.clear()
        peerRssiMap.clear()
        peerTruncatedPubkeyMap.clear()

        try {
            sendExecutor.shutdown()
        } catch (e: Exception) {}

        notifyTransportState()
        Log.i(TAG, "CFM1 Native BLE Mesh engine stopped")
    }

    // ==========================================
    // 1. PERIPHERAL ROLE: GATT Server
    // ==========================================
    private fun startGattServer() {
        val gattServerCallback = object : BluetoothGattServerCallback() {
            override fun onCharacteristicReadRequest(
                device: BluetoothDevice,
                requestId: Int,
                offset: Int,
                characteristic: BluetoothGattCharacteristic
            ) {
                if (characteristic.uuid == PEER_IDENTITY_CHAR_UUID) {
                    val beacon = buildCompactBeacon()
                    try {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, beacon)
                    } catch (e: SecurityException) {
                        Log.e(TAG, "SecurityException onCharacteristicReadRequest: ${e.message}")
                    }
                    return
                }

                try {
                    gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, characteristic.value)
                } catch (e: SecurityException) {}
            }

            override fun onCharacteristicWriteRequest(
                device: BluetoothDevice,
                requestId: Int,
                characteristic: BluetoothGattCharacteristic,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                if (value != null && characteristic.uuid == TX_RX_FRAME_CHAR_UUID) {
                    handleIncomingRawChunk(device.address, value)
                }

                if (responseNeeded) {
                    try {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                    } catch (e: SecurityException) {
                        Log.e(TAG, "SecurityException onCharacteristicWriteRequest: ${e.message}")
                    }
                }
            }

            override fun onDescriptorWriteRequest(
                device: BluetoothDevice,
                requestId: Int,
                descriptor: BluetoothGattDescriptor,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                if (descriptor.uuid == CCCD_DESCRIPTOR_UUID) {
                    serverConnectedDevices.add(device)
                    val address = device.address
                    val peerName = try { device.name ?: "Nearby CFM1 Node" } catch (e: SecurityException) { "Nearby CFM1 Node" }
                    val mtu = peerNegotiatedMtu[address] ?: (DEFAULT_ATT_MTU - 3)
                    val truncatedPub = peerTruncatedPubkeyMap[address] ?: ""

                    onPeerDiscovered?.invoke(address, address, -60, peerName, mtu, truncatedPub)
                    notifyTransportState()
                }

                if (responseNeeded) {
                    try {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                    } catch (e: SecurityException) {}
                }
            }

            override fun onMtuChanged(device: BluetoothDevice, mtu: Int) {
                Log.d(TAG, "Server GATT MTU negotiated for ${device.address}: $mtu bytes")
                val usableMtu = mtu - 3
                peerNegotiatedMtu[device.address] = usableMtu
                notifyTransportState()
            }

            override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
                val address = device.address
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    serverConnectedDevices.add(device)
                    val peerName = try { device.name ?: "Nearby CFM1 Node" } catch (e: SecurityException) { "Nearby CFM1 Node" }
                    val mtu = peerNegotiatedMtu[address] ?: (DEFAULT_ATT_MTU - 3)
                    val truncatedPub = peerTruncatedPubkeyMap[address] ?: ""
                    onPeerDiscovered?.invoke(address, address, -60, peerName, mtu, truncatedPub)
                    notifyTransportState()
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    serverConnectedDevices.remove(device)
                    peerNegotiatedMtu.remove(address)
                    if (!connectedPeers.containsKey(address)) {
                        onPeerLost?.invoke(address)
                    }
                    notifyTransportState()
                }
            }

            override fun onNotificationSent(device: BluetoothDevice?, status: Int) {
                // Advance serialized write queue
                isWriting.set(false)
            }
        }

        try {
            gattServer = bluetoothManager?.openGattServer(context, gattServerCallback)
            val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)

            // 1. Bidirectional Frame Characteristic (Write, WriteNoResp, Notify, CCCD)
            val txRxChar = BluetoothGattCharacteristic(
                TX_RX_FRAME_CHAR_UUID,
                BluetoothGattCharacteristic.PROPERTY_READ or
                        BluetoothGattCharacteristic.PROPERTY_WRITE or
                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE or
                        BluetoothGattCharacteristic.PROPERTY_NOTIFY,
                BluetoothGattCharacteristic.PERMISSION_READ or BluetoothGattCharacteristic.PERMISSION_WRITE
            )
            val cccd = BluetoothGattDescriptor(
                CCCD_DESCRIPTOR_UUID,
                BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE
            )
            txRxChar.addDescriptor(cccd)
            service.addCharacteristic(txRxChar)

            // 2. Peer Identity Characteristic (Read-only compact beacon)
            val identityChar = BluetoothGattCharacteristic(
                PEER_IDENTITY_CHAR_UUID,
                BluetoothGattCharacteristic.PROPERTY_READ,
                BluetoothGattCharacteristic.PERMISSION_READ
            )
            identityChar.value = buildCompactBeacon()
            service.addCharacteristic(identityChar)

            gattServer?.addService(service)
            txRxServerChar = txRxChar
            peerIdentityServerChar = identityChar
            Log.d(TAG, "CFM1 GATT Server registered with Service $SERVICE_UUID")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting GATT server: ${e.message}")
        }
    }

    private fun stopGattServer() {
        try {
            gattServer?.close()
            gattServer = null
            txRxServerChar = null
            peerIdentityServerChar = null
        } catch (e: Exception) {}
    }

    // ==========================================
    // 2. PERIPHERAL ROLE: BLE Advertising
    // ==========================================
    private fun startAdvertising() {
        advertiser = bluetoothAdapter?.bluetoothLeAdvertiser
        if (advertiser == null) return

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .build()

        val compactBeacon = buildCompactBeacon()
        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .addServiceData(ParcelUuid(SERVICE_UUID), compactBeacon)
            .build()

        advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                Log.d(TAG, "CFM1 BLE Mesh advertising active with compact service data")
                notifyTransportState()
            }

            override fun onStartFailure(errorCode: Int) {
                Log.w(TAG, "CFM1 BLE Mesh advertising failed: code $errorCode")
            }
        }

        try {
            advertiser?.startAdvertising(settings, data, advertiseCallback)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting advertising: ${e.message}")
        }
    }

    private fun stopAdvertising() {
        try {
            advertiseCallback?.let { advertiser?.stopAdvertising(it) }
            advertiseCallback = null
        } catch (e: Exception) {}
    }

    // ==========================================
    // 3. CENTRAL ROLE: Hardware ScanFilter & Duty Cycle
    // ==========================================
    private fun startDutyCycledScanning() {
        scanner = bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null) return

        // Hardware filter matching CFM1 Service UUID - critical for screen-off survival!
        val scanFilter = ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()
        val filters = listOf(scanFilter)

        val scanSettings = ScanSettings.Builder()
            .setScanMode(currentScanTier.scanMode)
            .setReportDelay(0)
            .build()

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                handleScanResult(result)
            }

            override fun onBatchScanResults(results: MutableList<ScanResult>?) {
                results?.forEach { handleScanResult(it) }
            }

            override fun onScanFailed(errorCode: Int) {
                Log.w(TAG, "CFM1 BLE Scan failed: code $errorCode")
            }
        }

        dutyCycleHandler = Handler(Looper.getMainLooper())
        triggerScanCycle(filters, scanSettings)
    }

    private fun triggerScanCycle(filters: List<ScanFilter>, scanSettings: ScanSettings) {
        if (!isRunning) return

        try {
            scanner?.startScan(filters, scanSettings, scanCallback)
            isDutyCycleScanning = true
            notifyTransportState()
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting hardware filtered scan: ${e.message}")
        }

        // Duty cycle pause
        dutyCycleHandler?.postDelayed({
            if (!isRunning) return@postDelayed
            try {
                scanCallback?.let { scanner?.stopScan(it) }
                isDutyCycleScanning = false
                notifyTransportState()
            } catch (e: Exception) {}

            // Duty cycle restart
            dutyCycleHandler?.postDelayed({
                if (isRunning) {
                    val activeSettings = ScanSettings.Builder()
                        .setScanMode(currentScanTier.scanMode)
                        .setReportDelay(0)
                        .build()
                    triggerScanCycle(filters, activeSettings)
                }
            }, currentScanTier.scanPauseMs)
        }, currentScanTier.scanActiveMs)
    }

    fun setScanTier(tierName: String): Boolean {
        val newTier = when (tierName.uppercase()) {
            "ACTIVE_MESH", "LOW_LATENCY", "TIER_1" -> ScanTier.ACTIVE_MESH
            "BACKGROUND", "LOW_POWER", "TIER_3", "BACKGROUND_LOW_POWER" -> ScanTier.BACKGROUND_LOW_POWER
            else -> ScanTier.FOREGROUND
        }

        if (currentScanTier != newTier) {
            currentScanTier = newTier
            Log.i(TAG, "Adaptive BLE Scan Tier switched to ${newTier.name} (Scan: ${newTier.scanActiveMs}ms, Pause: ${newTier.scanPauseMs}ms, Mode: ${newTier.scanMode})")
            if (isRunning) {
                stopDutyCycledScanning()
                startDutyCycledScanning()
            }
        }
        return true
    }

    fun getScanTier(): String {
        return currentScanTier.name
    }

    private fun stopDutyCycledScanning() {
        dutyCycleHandler?.removeCallbacksAndMessages(null)
        dutyCycleHandler = null
        try {
            scanCallback?.let { scanner?.stopScan(it) }
            scanCallback = null
            isDutyCycleScanning = false
        } catch (e: Exception) {}
    }

    private fun handleScanResult(result: ScanResult?) {
        val record = result?.scanRecord ?: return
        val serviceData = record.getServiceData(ParcelUuid(SERVICE_UUID))

        result.device?.let { device ->
            val address = device.address
            val rssi = result.rssi
            peerRssiMap[address] = rssi

            var truncatedPub = ""
            if (serviceData != null && serviceData.size >= 9) {
                // Extract truncated pubkey from service data advertisement
                val pubBytes = serviceData.sliceArray(1..8)
                truncatedPub = bytesToHex(pubBytes)
                peerTruncatedPubkeyMap[address] = truncatedPub
            }

            val peerName = try { device.name ?: "Nearby CFM1 Node" } catch (e: SecurityException) { "Nearby CFM1 Node" }
            val mtu = peerNegotiatedMtu[address] ?: (DEFAULT_ATT_MTU - 3)

            onPeerDiscovered?.invoke(address, address, rssi, peerName, mtu, truncatedPub)

            // Connect GATT as Central if not already connected
            val alreadyConnected = connectedPeers.containsKey(address) ||
                    serverConnectedDevices.any { it.address == address }
            if (!alreadyConnected) {
                connectToPeer(device)
            }
        }
    }

    private fun connectToPeer(device: BluetoothDevice) {
        val address = device.address

        val gattCallback = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    connectedPeers[address] = gatt
                    val peerName = try { device.name ?: "Nearby CFM1 Node" } catch (e: SecurityException) { "Nearby CFM1 Node" }
                    val rssi = peerRssiMap[address] ?: -65
                    val mtu = peerNegotiatedMtu[address] ?: (DEFAULT_ATT_MTU - 3)
                    val truncatedPub = peerTruncatedPubkeyMap[address] ?: ""

                    onPeerDiscovered?.invoke(address, address, rssi, peerName, mtu, truncatedPub)
                    notifyTransportState()

                    // Request 512 MTU immediately upon connection
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            val requested = gatt.requestMtu(TARGET_MTU)
                            Log.d(TAG, "Requested 512 MTU on Central connection to $address: $requested")
                        } else {
                            gatt.discoverServices()
                        }
                    } catch (e: SecurityException) {
                        try { gatt.discoverServices() } catch (ex: SecurityException) {}
                    }
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    connectedPeers.remove(address)
                    peerNegotiatedMtu.remove(address)
                    peerRssiMap.remove(address)
                    if (!serverConnectedDevices.any { it.address == address }) {
                        onPeerLost?.invoke(address)
                    }
                    notifyTransportState()
                    try {
                        gatt.close()
                    } catch (e: Exception) {}
                }
            }

            override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    val usableMtu = mtu - 3
                    Log.d(TAG, "Central MTU negotiated with $address: $mtu bytes (usable: $usableMtu)")
                    peerNegotiatedMtu[address] = usableMtu
                    notifyTransportState()
                }
                // Discover services after MTU negotiation completes
                try {
                    gatt.discoverServices()
                } catch (e: SecurityException) {}
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    val service = gatt.getService(SERVICE_UUID)

                    // 1. Enable notifications on TX_RX_FRAME_CHAR
                    val frameChar = service?.getCharacteristic(TX_RX_FRAME_CHAR_UUID)
                    if (frameChar != null) {
                        try {
                            gatt.setCharacteristicNotification(frameChar, true)
                            val cccd = frameChar.getDescriptor(CCCD_DESCRIPTOR_UUID)
                            if (cccd != null) {
                                if (Build.VERSION.SDK_INT >= 33) {
                                    gatt.writeDescriptor(cccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                                } else {
                                    @Suppress("DEPRECATION")
                                    cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                                    @Suppress("DEPRECATION")
                                    gatt.writeDescriptor(cccd)
                                }
                            }
                        } catch (e: SecurityException) {
                            Log.w(TAG, "Failed to enable notifications on characteristic: ${e.message}")
                        }
                    }

                    // 2. Read PEER_IDENTITY_CHAR
                    val identityChar = service?.getCharacteristic(PEER_IDENTITY_CHAR_UUID)
                    if (identityChar != null) {
                        try {
                            gatt.readCharacteristic(identityChar)
                        } catch (e: SecurityException) {}
                    }
                }
            }

            override fun onCharacteristicRead(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                status: Int
            ) {
                if (status == BluetoothGatt.GATT_SUCCESS && characteristic.uuid == PEER_IDENTITY_CHAR_UUID) {
                    val beacon = characteristic.value
                    if (beacon != null && beacon.size >= 9) {
                        val pubBytes = beacon.sliceArray(1..8)
                        val pubHex = bytesToHex(pubBytes)
                        peerTruncatedPubkeyMap[address] = pubHex

                        val peerName = try { device.name ?: "Nearby CFM1 Node" } catch (e: SecurityException) { "Nearby CFM1 Node" }
                        val rssi = peerRssiMap[address] ?: -65
                        val mtu = peerNegotiatedMtu[address] ?: (DEFAULT_ATT_MTU - 3)
                        onPeerDiscovered?.invoke(address, address, rssi, peerName, mtu, pubHex)
                    }
                }
            }

            @Suppress("DEPRECATION")
            override fun onCharacteristicChanged(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
                if (characteristic.uuid == TX_RX_FRAME_CHAR_UUID) {
                    val value = characteristic.value
                    if (value != null) {
                        handleIncomingRawChunk(address, value)
                    }
                }
            }

            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                value: ByteArray
            ) {
                if (characteristic.uuid == TX_RX_FRAME_CHAR_UUID) {
                    handleIncomingRawChunk(address, value)
                }
            }

            override fun onCharacteristicWrite(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
                isWriting.set(false)
                val success = status == BluetoothGatt.GATT_SUCCESS
                val len = characteristic?.value?.size ?: 0
                onNeighborWriteComplete?.invoke(address, success, len)
            }
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
            } else {
                device.connectGatt(context, false, gattCallback)
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException connecting to device $address: ${e.message}")
        }
    }

    // ==========================================
    // 4. CHUNK PARSING & SERIALIZED WRITE QUEUE
    // ==========================================
    private fun handleIncomingRawChunk(peerAddress: String, rawBytes: ByteArray) {
        if (rawBytes.size >= FRAGMENT_HEADER_SIZE) {
            val frameShortId = ((rawBytes[0].toInt() and 0xff) shl 8) or (rawBytes[1].toInt() and 0xff)
            val fragIdx = ((rawBytes[2].toInt() and 0xff) shl 8) or (rawBytes[3].toInt() and 0xff)
            val totalFrags = ((rawBytes[4].toInt() and 0xff) shl 8) or (rawBytes[5].toInt() and 0xff)
            val chunkHex = bytesToHex(rawBytes)

            onChunkReceived?.invoke(peerAddress, chunkHex, frameShortId, fragIdx, totalFrags)
        }

        // Also emit legacy string if valid JSON for backward compatibility
        try {
            val str = String(rawBytes, StandardCharsets.UTF_8)
            if (str.startsWith("{") && str.endsWith("}")) {
                onLegacyPacketReceived?.invoke(str)
            }
        } catch (e: Exception) {}
    }

    /**
     * Sends a chunk hex to a specific peer or broadcasts to all connected peers
     */
    fun sendChunk(peerId: String?, chunkHex: String): Boolean {
        if (!isRunning || (connectedPeers.isEmpty() && serverConnectedDevices.isEmpty())) {
            return false
        }

        val chunkBytes = hexToBytes(chunkHex)

        sendExecutor.execute {
            try {
                // If specific peer targeted
                if (peerId != null && peerId.isNotEmpty()) {
                    val gatt = connectedPeers[peerId]
                    if (gatt != null) {
                        writeChunkToGatt(gatt, chunkBytes)
                    } else {
                        val serverDevice = serverConnectedDevices.firstOrNull { it.address == peerId }
                        if (serverDevice != null) {
                            notifyChunkToServerDevice(serverDevice, chunkBytes)
                        }
                    }
                    return@execute
                }

                // Broadcast to all connected Central peers
                for ((_, gatt) in connectedPeers) {
                    writeChunkToGatt(gatt, chunkBytes)
                    Thread.sleep(INTER_PACKET_PACE_MS)
                }

                // Broadcast to all connected Server peers
                for (device in serverConnectedDevices) {
                    notifyChunkToServerDevice(device, chunkBytes)
                    Thread.sleep(INTER_PACKET_PACE_MS)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in sendChunk: ${e.message}")
            }
        }

        return true
    }

    private fun writeChunkToGatt(gatt: BluetoothGatt, chunkBytes: ByteArray) {
        val service = gatt.getService(SERVICE_UUID)
        val char = service?.getCharacteristic(TX_RX_FRAME_CHAR_UUID) ?: return

        isWriting.set(true)
        char.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
        if (Build.VERSION.SDK_INT >= 33) {
            gatt.writeCharacteristic(char, chunkBytes, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
        } else {
            @Suppress("DEPRECATION")
            char.value = chunkBytes
            @Suppress("DEPRECATION")
            gatt.writeCharacteristic(char)
        }
    }

    private fun notifyChunkToServerDevice(device: BluetoothDevice, chunkBytes: ByteArray) {
        val server = gattServer ?: return
        val char = txRxServerChar ?: return

        isWriting.set(true)
        if (Build.VERSION.SDK_INT >= 33) {
            server.notifyCharacteristicChanged(device, char, false, chunkBytes)
        } else {
            @Suppress("DEPRECATION")
            char.value = chunkBytes
            @Suppress("DEPRECATION")
            server.notifyCharacteristicChanged(device, char, false)
        }
    }

    private fun buildCompactBeacon(): ByteArray {
        val beacon = ByteArray(13)
        beacon[0] = 0x01 // Protocol version 1 (CFM1)
        System.arraycopy(localTruncatedPubkey, 0, beacon, 1, 8)
        System.arraycopy(localSyncHash, 0, beacon, 9, 4)
        return beacon
    }

    private fun parseOrPadBytes(hex: String, size: Int): ByteArray {
        val arr = ByteArray(size)
        if (hex.isNotEmpty()) {
            val raw = hexToBytes(hex)
            val copyLen = Math.min(raw.size, size)
            System.arraycopy(raw, 0, arr, 0, copyLen)
        }
        return arr
    }

    private fun notifyTransportState() {
        val isScanning = isDutyCycleScanning
        val isAdv = advertiser != null
        val totalPeers = connectedPeers.size + serverConnectedDevices.size
        val maxMtu = peerNegotiatedMtu.values.maxOrNull() ?: (DEFAULT_ATT_MTU - 3)

        onTransportStateChanged?.invoke(isScanning, isAdv, totalPeers, maxMtu)
    }

    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled ?: false
    }

    fun getConnectedPeersList(): List<Map<String, Any>> {
        val list = mutableListOf<Map<String, Any>>()
        for ((address, _) in connectedPeers) {
            list.add(mapOf(
                "peerId" to address,
                "role" to "central",
                "rssi" to (peerRssiMap[address] ?: -65),
                "mtu" to (peerNegotiatedMtu[address] ?: 20),
                "truncatedPubkey" to (peerTruncatedPubkeyMap[address] ?: "")
            ))
        }
        for (device in serverConnectedDevices) {
            val address = device.address
            if (!connectedPeers.containsKey(address)) {
                list.add(mapOf(
                    "peerId" to address,
                    "role" to "peripheral",
                    "rssi" to -60,
                    "mtu" to (peerNegotiatedMtu[address] ?: 20),
                    "truncatedPubkey" to (peerTruncatedPubkeyMap[address] ?: "")
                ))
            }
        }
        return list
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val sb = java.lang.StringBuilder()
        for (b in bytes) {
            sb.append(String.format("%02x", b))
        }
        return sb.toString()
    }

    private fun hexToBytes(hex: String): ByteArray {
        val clean = hex.trim()
        val len = clean.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(clean[i], 16) shl 4) + Character.digit(clean[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }
}
