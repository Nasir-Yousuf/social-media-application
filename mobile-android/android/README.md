# ClearFeed Mesh (Android Kotlin Native Application)

> **Decentralized Bluetooth Low Energy (BLE) Mesh Messaging for ClearFeed**  
> Adapted directly from the [bitchat-android](https://github.com/permissionlesstech/bitchat-android.git) protocol architecture.

---

## 🌟 Overview & Key Invariants

1. **100% Offline (No Wi-Fi / No Cellular Required)**:
   - Operates purely over Bluetooth Low Energy (BLE) radio hardware via concurrent Dual-Role architecture:
     - **Peripheral Role**: GATT Server with CCCD notifications and BLE Advertising.
     - **Central Role**: BLE Scanner and GATT Client connections.
   - Works completely offline with **Wi-Fi and Cellular Data turned OFF**.
2. **Multi-Hop Store-and-Forward Mesh Routing**:
   - Messages can hop up to 7 intermediate nodes with deduplication and zero-knowledge packet relay (`mesh/`).
3. **End-to-End Cryptography (Noise Protocol)**:
   - Noise Protocol framework (`Noise_XX_25519_ChaChaPoly_SHA256`) for mutual authentication, forward secrecy, and private 1-on-1 conversations (`noise/`).
   - Cryptographic signatures (`Ed25519`) and delivery receipts (`Delivered`, `Read`, `Relayed`).
4. **Rich Media Support**:
   - **Voice Notes & Audio**: Recorded in AAC/M4A (16 kHz mono), TLV packaged via `BitchatFilePacket`, fragmented across BLE MTU, with in-app audio playback and waveform visualization (`features/voice/`, `ui/media/`).
   - **Live Voice (Push-to-Talk)**: Real-time ephemeral voice burst frames (`VoiceBurstPacket`) over BLE mesh.
   - **Photos & Images**: Compressed JPEG/PNG images, sent via fragmented TLV file packets with progressive block-reveal decoding and full-screen zoomable viewer (`features/media/`, `ui/media/`).
   - **File Sharing**: Arbitrary file transfer across mesh nodes with MIME-type detection.
5. **ClearFeed Design System & Aesthetics**:
   - **Default Theme**: ClearFeed Dark (Pure OLED Black `#000000`, surface `#0E150E`, elevated card `#182118`, border `#2A3A2A`).
   - **Brand Accents**: ClearFeed Emerald `#00ba7c` (`#32D74B`) and Electric Cyan `#00A6F4` (`#0A84FF`).
   - **Jetpack Compose Material 3**: Fluid animations, haptic feedback, edge-to-edge UI.
6. **Cross-Platform BitChat Protocol Compatibility**:
   - 100% binary wire-compatible with the BitChat protocol on Android, iOS, and macOS.

---

## 📁 Codebase Architecture

```
mobile-android/android/
├── build.gradle.kts                # Root Gradle build script
├── settings.gradle.kts             # Gradle settings & module inclusion
├── gradle.properties               # JVM memory & build properties
├── gradle/
│   ├── wrapper/                    # Gradle wrapper binaries
│   └── libs.versions.toml          # Centralized dependency catalog (AGP, Compose, Nordic BLE)
├── app/
│   ├── build.gradle.kts            # Application Gradle build script
│   └── src/main/
│       ├── AndroidManifest.xml     # BLE permissions, Foreground Services, and activities
│       ├── java/com/bitchat/android/
│       │   ├── MainActivity.kt     # Main entry point & Compose root
│       │   ├── BitchatApplication.kt
│       │   ├── mesh/               # Core BLE mesh engine (32+ Kotlin classes)
│       │   │   ├── BluetoothMeshService.kt        # Dual-role BLE manager
│       │   │   ├── BluetoothGattClientManager.kt  # Serialized GATT client queue
│       │   │   ├── BluetoothGattServerManager.kt  # GATT server & CCCD broadcaster
│       │   │   ├── FragmentManager.kt             # Packet fragmentation & reassembly
│       │   │   ├── FragmentingPacketSender.kt
│       │   │   ├── PrivateMediaTransfer.kt        # Image/voice packet preparer
│       │   │   ├── PeerManager.kt                 # Active peer state & tracking
│       │   │   ├── MessageHandler.kt              # Inbound/outbound message coordinator
│       │   │   └── UnifiedMeshService.kt          # Transport abstraction
│       │   ├── protocol/           # Binary protocol specifications
│       │   │   ├── BinaryProtocol.kt              # BitchatPacket encode/decode (100% wire-compatible)
│       │   │   ├── CompressionUtil.kt             # Deflate/zlib compression
│       │   │   └── PacketPayloadLimits.kt
│       │   ├── noise/              # Noise Protocol encryption
│       │   │   ├── NoiseProtocol.kt               # Noise_XX_25519_ChaChaPoly_SHA256
│       │   │   └── AuthenticatedNoiseSession.kt
│       │   ├── features/
│       │   │   ├── voice/          # Voice recording, PTT bursts, audio compression
│       │   │   │   ├── VoiceRecorder.kt
│       │   │   │   ├── LiveVoiceCapture.kt
│       │   │   │   ├── LiveVoiceManager.kt
│       │   │   │   └── VoiceBurstPacket.kt
│       │   │   └── media/          # Image processing & compression
│       │   │       └── ImageUtils.kt
│       │   ├── service/            # Android Foreground Service
│       │   │   └── MeshForegroundService.kt       # Persistent background mesh execution
│       │   └── ui/                 # Jetpack Compose UI
│       │       ├── ChatScreen.kt                  # Full mesh conversation UI
│       │       ├── ChatViewModel.kt
│       │       ├── VoiceInputComponents.kt        # Hold-to-record voice note controls
│       │       └── media/                         # Media bubble, waveform, image viewer
│       │           ├── AudioMessageItem.kt
│       │           ├── ImageMessageItem.kt
│       │           ├── VoiceNotePlayer.kt
│       │           └── FullScreenImageViewer.kt
│       └── res/                    # Drawables, layouts, mipmaps, strings
└── wear/                           # Wear OS companion application target
```

---

## 🛠️ Building & Running

### Requirements
- Android SDK (API 26+)
- JDK 17 or JDK 21
- Android Studio Ladybug / Meerkat or Gradle CLI

### Build Debug APK
```bash
./gradlew assembleDebug
```
The resulting APK will be located at:
`app/build/outputs/apk/debug/app-debug.apk`

### Install to Connected Device
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Bluetooth Permissions & Background Reliability

ClearFeed Mesh requests:
- `BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT` (Android 12+)
- `ACCESS_FINE_LOCATION` (Required for BLE hardware discovery on Android)
- `FOREGROUND_SERVICE_CONNECTED_DEVICE` (Keeps the mesh alive when the screen is off)
- `RECORD_AUDIO` (For voice notes and live voice bursts)
- `CAMERA` / `READ_MEDIA_IMAGES` (For QR code pairing and image sending)
