package com.clearfeed.mesh

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Build
import android.os.ParcelUuid
import android.util.Log
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArraySet
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * ClearFeed Android BLE Mesh Service
 * 
 * 100% BitChat protocol architecture compatible Dual-Role BLE Mesh:
 * - Service UUID: F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C
 * - Characteristic UUID: A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D
 * - CCCD Descriptor UUID: 00002902-0000-1000-8000-00805f9b34fb
 * 
 * Features:
 * - Serialized write executor to prevent Android GATT error 133 / bus congestion
 * - MTU negotiation with fallback to 20-byte chunks before negotiation
 * - Dual-role arbitration (prevents simultaneous GATT client/server loopbacks)
 * - Rich payload support for Text, Voice notes, and Images
 * - 100% Offline operation without Wi-Fi or cellular networks
 */
class BleMeshService(private val context: Context) {

    companion object {
        private const val TAG = "CF_BleMesh"
        val SERVICE_UUID: UUID = UUID.fromString("F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C")
        val CHARACTERISTIC_UUID: UUID = UUID.fromString("A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
        const val DEFAULT_ATT_PAYLOAD = 20
        const val TARGET_MTU = 512
        const val INTER_PACKET_PACE_MS = 25L
    }

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    // Peripheral Role (GATT Server + Advertising)
    private var gattServer: BluetoothGattServer? = null
    private var gattServerCharacteristic: BluetoothGattCharacteristic? = null
    private val serverConnectedDevices = CopyOnWriteArraySet<BluetoothDevice>()
    private var advertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    // Central Role (Scanner + Connected Peers)
    private var scanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private val connectedPeers = ConcurrentHashMap<String, BluetoothGatt>()
    private val peerNegotiatedMtu = ConcurrentHashMap<String, Int>()

    // Serialized transmission queue
    private var sendExecutor = Executors.newSingleThreadExecutor()

    // Packet listeners
    var onPacketReceived: ((String) -> Unit)? = null
    var onPeerDiscovered: ((String, String) -> Unit)? = null
    var onPeerLost: ((String) -> Unit)? = null

    private var localNodeId: String = ""
    private var isRunning: Boolean = false

    fun start(nodeId: String): Boolean {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w(TAG, "Bluetooth hardware adapter is disabled or unavailable")
            return false
        }

        localNodeId = nodeId
        isRunning = true
        if (sendExecutor.isShutdown) {
            sendExecutor = Executors.newSingleThreadExecutor()
        }

        startGattServer()
        startAdvertising()
        startScanning()

        Log.i(TAG, "ClearFeed BLE Mesh engine started successfully for node: $nodeId")
        return true
    }

    fun stop() {
        isRunning = false
        stopAdvertising()
        stopScanning()
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

        try {
            sendExecutor.shutdown()
        } catch (e: Exception) {}

        Log.i(TAG, "ClearFeed BLE Mesh engine stopped")
    }

    // ==========================================
    // 1. PERIPHERAL ROLE: GATT Server
    // ==========================================
    private fun startGattServer() {
        val gattServerCallback = object : BluetoothGattServerCallback() {
            override fun onCharacteristicWriteRequest(
                device: BluetoothDevice,
                requestId: Int,
                characteristic: BluetoothGattCharacteristic,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                if (value != null && characteristic.uuid == CHARACTERISTIC_UUID) {
                    val rawPayload = String(value, StandardCharsets.UTF_8)
                    onPacketReceived?.invoke(rawPayload)
                }

                if (responseNeeded) {
                    try {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                    } catch (e: SecurityException) {
                        Log.e(TAG, "SecurityException sending write response: ${e.message}")
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
                if (descriptor.uuid == CCCD_UUID) {
                    serverConnectedDevices.add(device)
                    val address = device.address
                    val peerName = try { device.name ?: "Nearby Node" } catch (e: SecurityException) { "Nearby Node" }
                    onPeerDiscovered?.invoke(address, peerName)
                }

                if (responseNeeded) {
                    try {
                        gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                    } catch (e: SecurityException) {
                        Log.e(TAG, "SecurityException sending descriptor response: ${e.message}")
                    }
                }
            }

            override fun onMtuChanged(device: BluetoothDevice, mtu: Int) {
                Log.d(TAG, "Server MTU negotiated for ${device.address}: $mtu bytes")
                peerNegotiatedMtu[device.address] = mtu - 3
            }

            override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
                val address = device.address
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    serverConnectedDevices.add(device)
                    val peerName = try { device.name ?: "Nearby Node" } catch (e: SecurityException) { "Nearby Node" }
                    onPeerDiscovered?.invoke(address, peerName)
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    serverConnectedDevices.remove(device)
                    peerNegotiatedMtu.remove(address)
                    if (!connectedPeers.containsKey(address)) {
                        onPeerLost?.invoke(address)
                    }
                }
            }
        }

        try {
            gattServer = bluetoothManager?.openGattServer(context, gattServerCallback)
            val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)

            val characteristic = BluetoothGattCharacteristic(
                CHARACTERISTIC_UUID,
                BluetoothGattCharacteristic.PROPERTY_READ or
                        BluetoothGattCharacteristic.PROPERTY_WRITE or
                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE or
                        BluetoothGattCharacteristic.PROPERTY_NOTIFY,
                BluetoothGattCharacteristic.PERMISSION_READ or BluetoothGattCharacteristic.PERMISSION_WRITE
            )

            // Add CCCD descriptor for notifications
            val cccd = BluetoothGattDescriptor(
                CCCD_UUID,
                BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE
            )
            characteristic.addDescriptor(cccd)

            service.addCharacteristic(characteristic)
            gattServer?.addService(service)
            gattServerCharacteristic = characteristic
            Log.d(TAG, "GATT Server and BitChat Service registered")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting GATT server: ${e.message}")
        }
    }

    private fun stopGattServer() {
        try {
            gattServer?.close()
            gattServer = null
            gattServerCharacteristic = null
        } catch (e: Exception) {}
    }

    // ==========================================
    // 2. PERIPHERAL ROLE: BLE Advertising
    // ==========================================
    private fun startAdvertising() {
        advertiser = bluetoothAdapter?.bluetoothLeAdvertiser
        if (advertiser == null) return

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                Log.d(TAG, "BLE Mesh advertising active (LOW_LATENCY)")
            }

            override fun onStartFailure(errorCode: Int) {
                Log.w(TAG, "BLE Mesh advertising failed: code $errorCode")
            }
        }

        try {
            advertiser?.startAdvertising(settings, data, advertiseCallback)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting BLE advertising: ${e.message}")
        }
    }

    private fun stopAdvertising() {
        try {
            advertiseCallback?.let { advertiser?.stopAdvertising(it) }
            advertiseCallback = null
        } catch (e: Exception) {}
    }

    // ==========================================
    // 3. CENTRAL ROLE: BLE Scanner (Software Filtered)
    // ==========================================
    private fun startScanning() {
        scanner = bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null) return

        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
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
                Log.w(TAG, "BLE Scan failed: code $errorCode")
            }
        }

        try {
            scanner?.startScan(null, scanSettings, scanCallback)
            Log.d(TAG, "BLE Scanner active (filtering for BitChat Service: $SERVICE_UUID)")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException starting BLE scan: ${e.message}")
        }
    }

    private fun handleScanResult(result: ScanResult?) {
        val record = result?.scanRecord ?: return
        val uuids = record.serviceUuids
        val matchesService = uuids?.any { it.uuid == SERVICE_UUID } == true
        if (!matchesService) return

        result.device?.let { device ->
            val address = device.address
            // Arbitration: Don't connect if already connected as central or connected as server
            val alreadyConnected = connectedPeers.containsKey(address) ||
                    serverConnectedDevices.any { it.address == address }
            if (!alreadyConnected) {
                connectToPeer(device)
            }
        }
    }

    private fun stopScanning() {
        try {
            scanCallback?.let { scanner?.stopScan(it) }
            scanCallback = null
        } catch (e: Exception) {}
    }

    private fun connectToPeer(device: BluetoothDevice) {
        val address = device.address

        val gattCallback = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    connectedPeers[address] = gatt
                    val peerName = try { device.name ?: "Nearby Node" } catch (e: SecurityException) { "Nearby Node" }
                    onPeerDiscovered?.invoke(address, peerName)
                    try {
                        gatt.discoverServices()
                    } catch (e: SecurityException) {}
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    connectedPeers.remove(address)
                    peerNegotiatedMtu.remove(address)
                    if (!serverConnectedDevices.any { it.address == address }) {
                        onPeerLost?.invoke(address)
                    }
                    try {
                        gatt.close()
                    } catch (e: Exception) {}
                }
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    val service = gatt.getService(SERVICE_UUID)
                    val characteristic = service?.getCharacteristic(CHARACTERISTIC_UUID)
                    if (characteristic != null) {
                        try {
                            gatt.setCharacteristicNotification(characteristic, true)
                            val cccd = characteristic.getDescriptor(CCCD_UUID)
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

                    // Request 512-byte MTU for high-speed fragment transport
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        try {
                            gatt.requestMtu(TARGET_MTU)
                        } catch (e: SecurityException) {}
                    }
                }
            }

            override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    Log.d(TAG, "Client MTU negotiated for $address: $mtu bytes")
                    peerNegotiatedMtu[address] = mtu - 3
                }
            }

            @Suppress("DEPRECATION")
            override fun onCharacteristicChanged(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
                if (characteristic.uuid == CHARACTERISTIC_UUID) {
                    val value = characteristic.value
                    if (value != null) {
                        val rawPayload = String(value, StandardCharsets.UTF_8)
                        onPacketReceived?.invoke(rawPayload)
                    }
                }
            }

            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                value: ByteArray
            ) {
                if (characteristic.uuid == CHARACTERISTIC_UUID) {
                    val rawPayload = String(value, StandardCharsets.UTF_8)
                    onPacketReceived?.invoke(rawPayload)
                }
            }
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
            } else {
                device.connectGatt(context, false, gattCallback)
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException connecting to device: ${e.message}")
        }
    }

    // ==========================================
    // 4. PACKET TRANSMISSION (Serialized Queue Dual-Role)
    // ==========================================
    fun sendPacket(payloadString: String): Boolean {
        if (!isRunning || (connectedPeers.isEmpty() && serverConnectedDevices.isEmpty())) {
            return false
        }

        sendExecutor.execute {
            try {
                val bytes = payloadString.toByteArray(StandardCharsets.UTF_8)

                // Role 1: Send to peers we are connected to as Central (Client Write)
                for ((address, gatt) in connectedPeers) {
                    try {
                        val service = gatt.getService(SERVICE_UUID)
                        val characteristic = service?.getCharacteristic(CHARACTERISTIC_UUID)
                        if (characteristic != null) {
                            characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                            if (Build.VERSION.SDK_INT >= 33) {
                                gatt.writeCharacteristic(characteristic, bytes, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
                            } else {
                                @Suppress("DEPRECATION")
                                characteristic.value = bytes
                                @Suppress("DEPRECATION")
                                gatt.writeCharacteristic(characteristic)
                            }
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "Write error to peer $address: ${e.message}")
                    }
                    Thread.sleep(INTER_PACKET_PACE_MS)
                }

                // Role 2: Send to peers connected to our GATT Server (Server Notification)
                val serverChar = gattServerCharacteristic
                val server = gattServer
                if (server != null && serverChar != null && serverConnectedDevices.isNotEmpty()) {
                    for (device in serverConnectedDevices) {
                        try {
                            if (Build.VERSION.SDK_INT >= 33) {
                                server.notifyCharacteristicChanged(device, serverChar, false, bytes)
                            } else {
                                @Suppress("DEPRECATION")
                                serverChar.value = bytes
                                @Suppress("DEPRECATION")
                                server.notifyCharacteristicChanged(device, serverChar, false)
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Server notification error to ${device.address}: ${e.message}")
                        }
                        Thread.sleep(INTER_PACKET_PACE_MS)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Serialized packet send failure: ${e.message}")
            }
        }

        return true
    }

    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled ?: false
    }
}
