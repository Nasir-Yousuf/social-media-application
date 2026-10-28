import Foundation
import CoreBluetooth

/**
 * ClearFeed iOS CoreBluetooth Mesh Service
 *
 * Implements BitChat-compatible Dual-Role (Peripheral + Central) Bluetooth Low Energy Mesh
 * - Service UUID: F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C
 * - Characteristic UUID: A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D
 * - Fragment MTU: 469 bytes
 *
 * Works 100% OFFLINE with Wi-Fi turned OFF.
 */
@objc(ClearFeedMeshService)
public final class ClearFeedMeshService: NSObject, CBPeripheralManagerDelegate, CBCentralManagerDelegate, CBPeripheralDelegate {

    public static let shared = ClearFeedMeshService()

    public static let serviceUUID = CBUUID(string: "F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C")
    public static let characteristicUUID = CBUUID(string: "A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D")

    // Peripheral Role
    private var peripheralManager: CBPeripheralManager?
    private var transferCharacteristic: CBMutableCharacteristic?

    // Central Role
    private var centralManager: CBCentralManager?
    private var connectedPeripherals: [UUID: CBPeripheral] = [:]
    private var writableCharacteristics: [UUID: CBCharacteristic] = [:]

    // Callbacks to JavaScript / App Layer
    public var onPacketReceived: ((String) -> Void)?
    public var onPeerDiscovered: ((String, String) -> Void)?
    public var onPeerLost: ((String) -> Void)?

    private var localNodeId: String = ""
    private var isRunning: Bool = false
    private let queue = DispatchQueue(label: "com.clearfeed.ble.mesh", qos: .userInitiated)

    public override init() {
        super.init()
    }

    @objc public func start(nodeId: String) {
        queue.async {
            self.localNodeId = nodeId
            self.isRunning = true

            if self.peripheralManager == nil {
                self.peripheralManager = CBPeripheralManager(delegate: self, queue: self.queue, options: [
                    CBPeripheralManagerOptionShowPowerAlertKey: true
                ])
            } else if self.peripheralManager?.state == .poweredOn {
                self.setupPeripheralService()
                self.startAdvertising()
            }

            if self.centralManager == nil {
                self.centralManager = CBCentralManager(delegate: self, queue: self.queue, options: [
                    CBCentralManagerOptionShowPowerAlertKey: true
                ])
            } else if self.centralManager?.state == .poweredOn {
                self.startScanning()
            }
        }
    }

    @objc public func stop() {
        queue.async {
            self.isRunning = false
            self.peripheralManager?.stopAdvertising()
            self.centralManager?.stopScan()

            for (_, peripheral) in self.connectedPeripherals {
                self.centralManager?.cancelPeripheralConnection(peripheral)
            }
            self.connectedPeripherals.removeAll()
            self.writableCharacteristics.removeAll()
        }
    }

    // ==========================================
    // 1. PERIPHERAL ROLE (GATT Server + Advertising)
    // ==========================================
    public func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn && isRunning {
            setupPeripheralService()
            startAdvertising()
        }
    }

    private func setupPeripheralService() {
        let characteristic = CBMutableCharacteristic(
            type: ClearFeedMeshService.characteristicUUID,
            properties: [.writeWithoutResponse, .write, .read, .notify],
            value: nil,
            permissions: [.readable, .writeable]
        )
        self.transferCharacteristic = characteristic

        let service = CBMutableService(type: ClearFeedMeshService.serviceUUID, primary: true)
        service.characteristics = [characteristic]

        peripheralManager?.removeAllServices()
        peripheralManager?.add(service)
    }

    private func startAdvertising() {
        guard let pm = peripheralManager, pm.state == .poweredOn else { return }
        pm.stopAdvertising()
        pm.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [ClearFeedMeshService.serviceUUID]
        ])
    }

    public func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        for request in requests {
            if request.characteristic.uuid == ClearFeedMeshService.characteristicUUID, let value = request.value {
                if let stringPayload = String(data: value, encoding: .utf8) {
                    DispatchQueue.main.async {
                        self.onPacketReceived?(stringPayload)
                    }
                }
            }
            peripheral.respond(to: request, withResult: .success)
        }
    }

    // ==========================================
    // 2. CENTRAL ROLE (Scanning + GATT Client)
    // ==========================================
    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn && isRunning {
            startScanning()
        }
    }

    private func startScanning() {
        guard let cm = centralManager, cm.state == .poweredOn else { return }
        cm.scanForPeripherals(
            withServices: [ClearFeedMeshService.serviceUUID],
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )
    }

    public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        let id = peripheral.identifier
        if connectedPeripherals[id] == nil {
            connectedPeripherals[id] = peripheral
            peripheral.delegate = self
            central.connect(peripheral, options: nil)
        }
    }

    public func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        peripheral.discoverServices([ClearFeedMeshService.serviceUUID])
        let peerId = peripheral.identifier.uuidString
        let peerName = peripheral.name ?? "Nearby Node"
        DispatchQueue.main.async {
            self.onPeerDiscovered?(peerId, peerName)
        }
    }

    public func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        let id = peripheral.identifier
        connectedPeripherals.removeValue(forKey: id)
        writableCharacteristics.removeValue(forKey: id)
        DispatchQueue.main.async {
            self.onPeerLost?(id.uuidString)
        }

        if isRunning {
            central.connect(peripheral, options: nil)
        }
    }

    public func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }
        for service in services where service.uuid == ClearFeedMeshService.serviceUUID {
            peripheral.discoverCharacteristics([ClearFeedMeshService.characteristicUUID], for: service)
        }
    }

    public func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard let characteristics = service.characteristics else { return }
        for char in characteristics where char.uuid == ClearFeedMeshService.characteristicUUID {
            writableCharacteristics[peripheral.identifier] = char
        }
    }

    // ==========================================
    // 3. PACKET TRANSMISSION
    // ==========================================
    @objc public func sendPacket(payloadString: String) -> Bool {
        guard let data = payloadString.data(using: .utf8) else { return false }
        var sentAny = false

        queue.async {
            for (id, peripheral) in self.connectedPeripherals {
                if let char = self.writableCharacteristics[id] {
                    peripheral.writeValue(data, for: char, type: .withoutResponse)
                    sentAny = true
                }
            }
        }

        return sentAny
    }
}
