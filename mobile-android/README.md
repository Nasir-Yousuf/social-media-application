# ClearFeed Mobile (Android)

The official ClearFeed mobile application for Android, featuring both full social platform capabilities and a 100% offline, decentralized Bluetooth Low Energy (BLE) Mesh messaging system adapted directly from the [bitchat-android](https://github.com/permissionlesstech/bitchat-android.git) architecture.

---

## 🚀 Key Features

### 1. Online Social Platform
* **Feed & Timeline**: Chronological anti-algorithm post feed with syntax highlighting for code snippets.
* **Direct Messages**: Real-time online 1-on-1 chats via WebSocket and REST API.
* **Explore & Members**: Search and discovery for developers, topics, and code.
* **Learn & CodeHub**: Curated interactive coding lessons, animations, and practice environments.
* **Profiles & Customization**: User badges, themes (OLED Dark Mode, Light Mode), and account management.

### 2. Offline Bluetooth Low Energy Mesh System (BitChat Compatible)
* **100% Offline (No Wi-Fi / No Cellular Required)**:
  * Dual-role BLE stack (simultaneous Peripheral advertising/GATT server and Central scanning/GATT client).
  * Communicates purely peer-to-peer over device Bluetooth hardware.
* **Multimedia Mesh Messaging**:
  * **Text Messages**: Broadcast and private 1-on-1 encrypted messaging.
  * **Photos & Images**: Camera and gallery attachments with compression and progressive chunking.
  * **Voice Notes & Live Voice**: Voice recordings (AAC/M4A) and real-time push-to-talk burst streaming.
* **End-to-End Cryptography**:
  * Noise Protocol (`Noise_XX_25519_ChaChaPoly_SHA256`) for mutual peer authentication and forward secrecy.
  * Ed25519 digital signatures and zero-knowledge packet relay across up to 7 hops.
* **Continuous Background Operation**:
  * Android Foreground Service (`FOREGROUND_SERVICE_CONNECTED_DEVICE`) keeps the BLE mesh engine active when the screen is locked or app is in the background.

---

## 📁 Directory Structure

```
mobile-android/
├── android/                        # Full Native Kotlin Android project (BitChat architecture)
│   ├── build.gradle.kts            # Root Gradle build script
│   ├── settings.gradle.kts         # Module settings
│   ├── gradle/libs.versions.toml   # Dependency catalog (AGP, Compose, Nordic BLE)
│   └── app/src/main/
│       ├── AndroidManifest.xml     # Android permissions, Foreground Service, Bluetooth features
│       └── java/com/bitchat/android/
│           ├── mesh/               # Core BLE mesh engine (32+ Kotlin classes)
│           ├── protocol/           # BinaryProtocol (BitchatPacket, TLV files, compression)
│           ├── noise/              # Noise Protocol E2EE implementation
│           ├── features/voice/     # Voice recorder, PTT bursts, audio playback
│           ├── features/media/     # Image compression and progressive reveal
│           └── service/            # MeshForegroundService persistent connectivity
├── modules/
│   └── clearfeed-ble-mesh/         # Native Expo/Android bridge for BLE mesh
├── src/
│   ├── components/                 # Reusable UI components
│   ├── context/                    # Auth, Theme, and Notification state
│   ├── screens/
│   │   ├── HomeScreen.jsx          # Social feed
│   │   ├── MessagesScreen.jsx      # Online messaging
│   │   ├── LearnScreen.jsx         # Learning hub
│   │   ├── ExploreScreen.jsx       # Discovery & search
│   │   └── mesh/                   # Offline Bluetooth Mesh subsystem
│   │       ├── MeshHomeScreen.jsx
│   │       ├── MeshConversationScreen.jsx # Text, Image, and Voice mesh chat
│   │       ├── MeshPeersScreen.jsx
│   │       └── MeshSettingsScreen.jsx
│   └── mesh/                       # Mesh routing, crypto, and transport protocols
├── app.json                        # Android app manifest configuration
└── package.json                    # Scripts and dependencies
```

---

## 🛠️ Build & Run Commands

### Run ClearFeed Mobile (Android)
From repository root:
```bash
npm run dev:mobile
```
Or inside `mobile-android`:
```bash
cd mobile-android
npm start
```

### Run Protocol & Crypto Test Suite
```bash
cd mobile-android
npm run test:mesh
```

### Build Native Android APK directly with Gradle
```bash
cd mobile-android/android
./gradlew assembleDebug
```
The APK will be generated at:
`mobile-android/android/app/build/outputs/apk/debug/app-debug.apk`

### Build via EAS (Standalone APK)
```bash
cd mobile-android
npm run build:apk
```

