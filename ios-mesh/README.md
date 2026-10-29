# ClearFeed Mesh (iOS Swift Native Application)

> **Decentralized Bluetooth Low Energy (BLE) Mesh Messaging for ClearFeed**  
> Adapted directly from the [BitChat](https://github.com/permissionlesstech/bitchat.git) protocol architecture.

---

## 🌟 Overview & Key Invariants

1. **100% Offline (No Wi-Fi / No Cellular Required)**:
   - Operates purely over CoreBluetooth radio hardware via concurrent `CBPeripheralManager` (advertising + GATT server) and `CBCentralManager` (scanning + GATT client).
   - **Wi-Fi can be completely turned OFF** in iOS Settings / Control Center. The mesh does not require or touch Apple MultipeerConnectivity, AWDL, or local Wi-Fi networks.
2. **Multi-Hop Store-and-Forward Mesh Routing**:
   - Messages can hop up to 7 intermediate nodes with deduplication and zero-knowledge packet forwarding (`Services/BLE/`).
3. **End-to-End Cryptography**:
   - Noise Protocol encryption for private 1-on-1 conversations (`Noise/`).
   - Cryptographic signatures and delivery receipts (`Delivered`, `Read`, `Relayed`).
4. **ClearFeed Design System & Aesthetics**:
   - **Default Theme**: `ClearFeed Dark` (Pure OLED Black `#000000`, surface `#16181c`, elevated card `#202327`, border `#2f3336`).
   - **Brand Accents**: ClearFeed Emerald `#00ba7c` (`#10b981`) and Electric Cyan `#00A6F4`.
   - **Alternative Themes**: `CodeHub Emerald`, `Matrix Terminal`, and `Liquid Glass`.
   - **Typography**: Clean Apple system typography.

---

## 📁 Codebase Architecture

```
ios-mesh/
├── bitchat.xcodeproj/         # Xcode project file (Open with Xcode)
├── Package.swift              # Swift Package Manager manifest
├── Configs/                   # Build configurations (Debug & Release xcconfig)
├── localPackages/             # BitFoundation, BitLogger, Arti dependencies
├── bitchat/                   # Main Swift application target
│   ├── App/                   # App lifecycle (BitchatApp.swift, AppState, AppRuntime)
│   ├── Models/                # Message, Packet, and Peer data models
│   ├── Services/              # Backend services
│   │   ├── BLE/               # CoreBluetooth mesh engine (30+ Swift services)
│   │   │   ├── BLEService.swift
│   │   │   ├── BLEService+LinkLayerCentralRole.swift
│   │   │   ├── BLEService+LinkLayerPeripheralRole.swift
│   │   │   ├── BLERadioController.swift
│   │   │   ├── BLEFragmentHandler.swift
│   │   │   └── ...
│   │   ├── MessageRouter.swift
│   │   ├── UnifiedPeerService.swift
│   │   └── NoiseEncryptionService.swift
│   ├── Views/                 # SwiftUI view hierarchy
│   │   ├── ContentView.swift
│   │   ├── ContentHeaderView.swift    # Branded ClearFeed Mesh header
│   │   ├── ContentComposerView.swift  # Chat input bubble
│   │   ├── MeshPeerList.swift         # Nearby mesh peers
│   │   ├── AppInfoView.swift          # Settings & Theme switcher
│   │   └── Components/                # Radar, delivery badges, text views
│   └── Utils/
│       └── Theme.swift        # ClearFeed Design System color palettes & modifiers
```

---

## 🚀 How to Run in Xcode

1. Open `bitchat.xcodeproj` in Xcode on macOS:
   ```bash
   open bitchat.xcodeproj
   ```
2. In Xcode, select the **bitchat_iOS** target and your development team under **Signing & Capabilities**.
3. Connect your physical iPhone (or build for iOS Simulator).
   > **Note**: CoreBluetooth peripheral advertising requires a physical iOS device.
4. Turn **Wi-Fi OFF** in iOS Settings to verify pure Bluetooth Low Energy communication.
5. Deploy to two iPhones: they will discover each other automatically, appear on each other's mesh radar, and exchange encrypted peer-to-peer messages.
