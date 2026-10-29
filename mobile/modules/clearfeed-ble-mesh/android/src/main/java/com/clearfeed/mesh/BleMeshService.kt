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

/**
 * ClearFeed Android BLE Mesh Service
 * 
 * Implements BitChat-compatible Dual-Role (Peripheral + Central) Bluetooth Low Energy Mesh
 * - Service UUID: F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C
 * - Characteristic UUID: A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D
 * 
 * Works 100% OFFLINE with Wi-Fi turned OFF.
 */
class BleMeshService(private val context: Context) {

    companion object {
        private const val TAG = "CF_BleMesh"
        val SERVICE_UUID: UUID = UUID.fromString("F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C")
        val CHARACTERISTIC_UUID: UUID = UUID.fromString("A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D")
        const val MAX_FRAGMENT_PAYLOAD = 469
    }

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    // Peripheral Role (GATT Server + Advertising)
    private var gattServer: BluetoothGattServer? = null
    private var advertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    // Central Role (Scanner + Connected Peers)
    private var scanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private val connectedPeers = ConcurrentHashMap<String, BluetoothGatt>()

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

        startGattServer()
        startAdvertising()
        startScanning()

        Log.i(TAG, "ClearFeed BLE Mesh started successfully for node: $nodeId")
        return true
    }

    fun stop() {
        isRunning = false
        stopAdvertising()
        stopScanning()
        stopGattServer()

        for (gatt in connectedPeers.values) {
            try {
                gatt.close()
            } catch (e: Exception) {}
        }
        connectedPeers.clear()
        Log.i(TAG, "ClearFeed BLE Mesh stopped")
    }

    // ==========================================
    // 1. PERIPHERAL ROLE: GATT Server
    // ==========================================
    private fun startGattServer() {
        val gattServerCallback = object : BluetoothGattServerCallback() {
            override fun onCharacteristicWriteRequest(
                device: BluetoothDevice,
                requestId: Int,
                characteristic: BluetoothCharacteristic,
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
                    gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                }
            }

            override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
                val address = device.address
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    val peerName = try { device.name ?: "Nearby Node" } catch (e: SecurityException) { "Nearby Node" }
                    onPeerDiscovered?.invoke(address, peerName)
                    if (!connectedPeers.containsKey(address)) {
                        connectToPeer(device)
                    }
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    onPeerLost?.invoke(address)
                }
            }
        }

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

        service.addCharacteristic(characteristic)
        gattServer?.addService(service)
    }

    private fun stopGattServer() {
        try {
            gattServer?.close()
            gattServer = null
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
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                Log.d(TAG, "BLE Mesh advertising started successfully")
            }

            override fun onStartFailure(errorCode: Int) {
                Log.w(TAG, "BLE Mesh advertising failed with error code: $errorCode")
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
    // 3. CENTRAL ROLE: BLE Scanner
    // ==========================================
    private fun startScanning() {
        scanner = bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null) return

        val scanFilter = ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                result?.device?.let { device ->
                    val address = device.address
                    if (!connectedPeers.containsKey(address)) {
                        connectToPeer(device)
                    }
                }
            }
        }

        try {
            scanner?.startScan(listOf(scanFilter), scanSettings, scanCallback)
            Log.d(TAG, "BLE Scanner active for Service UUID: $SERVICE_UUID")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException during BLE scan: ${e.message}")
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
                    onPeerLost?.invoke(address)
                    try {
                        gatt.close()
                    } catch (e: Exception) {}
                }
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    // Request 512-byte MTU for high-speed fragment transport (matching BitChat)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        try {
                            gatt.requestMtu(512)
                        } catch (e: SecurityException) {}
                    }
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
    // 4. PACKET TRANSMISSION (Write Without Response)
    // ==========================================
    fun sendPacket(payloadString: String): Boolean {
        if (connectedPeers.isEmpty()) {
            return false
        }

        val bytes = payloadString.toByteArray(StandardCharsets.UTF_8)
        var anySuccess = false

        for ((_, gatt) in connectedPeers) {
            try {
                val service = gatt.getService(SERVICE_UUID)
                val characteristic = service?.getCharacteristic(CHARACTERISTIC_UUID)
                if (characteristic != null) {
                    characteristic.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                    if (Build.VERSION.SDK_INT >= 33) {
                        val res = gatt.writeCharacteristic(characteristic, bytes, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
                        if (res == 0) anySuccess = true
                    } else {
                        @Suppress("DEPRECATION")
                        characteristic.value = bytes
                        @Suppress("DEPRECATION")
                        val ok = gatt.writeCharacteristic(characteristic)
                        if (ok) anySuccess = true
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error writing to GATT peer: ${e.message}")
            }
        }

        return anySuccess
    }

    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled ?: false
    }
}

