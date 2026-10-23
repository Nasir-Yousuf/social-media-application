# Clearfeed Desktop Application

Clearfeed Desktop is a modern, native-feel desktop communication and learning application built with **Tauri 2**, **React 19**, **TypeScript**, **Rust**, and **Tailwind CSS v4**.

It bridges online course communication and learning (powered by the Clearfeed Express 5 backend and Socket.io) with **Clearfeed Mesh** — an offline-first encrypted peer-to-peer communication and learning system that operates independently of internet connectivity or cloud authentication.

---

## 🚀 Key Desktop Features

1. **🌿 Chronological Social Feed & Discussion**: Distraction-free feed, author status badges, and technical conversations.
2. **🎓 Clearfeed Learn & Academy**:
   - **All 15 Tracks & 446 Bilingual Lessons** available natively on desktop.
   - **Offline-First Learning**: All curriculum theory, exercises, and quizzes work 100% offline without requiring internet or account logins.
   - **Interactive Code Playground**: Embedded live code editor with simulated output console supporting HTML/CSS, JavaScript, Python, and SQL sandboxes.
   - **Hands-On Exercises & Instant Validation**: Real coding challenges with hints and verified solutions (+25 XP).
   - **Lesson Quizzes & Official Certificates**: Instant feedback on multiple-choice questions and printable track completion certificates.
3. **💻 Code Hub Studio**: Browse, copy, filter, and fork cohort code snippets.
4. **📡 Clearfeed Mesh (Offline P2P)**:
   - Account-free, serverless encrypted messaging using **Ed25519**, **X25519**, and **ChaCha20-Poly1305**.
   - Language-neutral **CFM1 Wire Protocol** interoperable with the Clearfeed Mobile app.
   - Zero-knowledge multi-hop store-and-forward relay.
5. **⌨️ Global Desktop Shortcuts**:
   - `Ctrl+B` / `Cmd+B`: Toggle collapsible sidebar
   - `Ctrl+L` / `Cmd+L`: Open Learn & Academy
   - `Ctrl+M` / `Cmd+M`: Open Clearfeed Mesh
   - `Ctrl+,` / `Cmd+,`: Open Settings

---

## Architecture Overview

```
desktop/
├── src/                          # React 19 + TypeScript Frontend
│   ├── api/                      # Axios client with dynamic base URL and JWT auth
│   ├── components/layout/        # Collapsible desktop sidebar, header status bar
│   ├── context/                  # ThemeContext, AuthContext
│   ├── data/                     # 15 Complete Learning Curricula (446 Lessons + Quizzes)
│   ├── mesh/                     # Clearfeed Mesh subsystem
│   │   ├── crypto/               # Ed25519 signatures, X25519 DH, ChaCha20-Poly1305 AEAD
│   │   ├── protocol/             # Language-neutral CFM1 versioned wire protocol
│   │   ├── routing/              # Multi-hop routing & receipt verification
│   │   ├── storage/              # Local mesh encrypted store & deduplication
│   │   └── transport/            # Desktop transport manager & honest state reporting
│   ├── services/                 # Socket.io real-time chat & signaling client
│   ├── types/                    # Core TypeScript models
│   └── views/                    # HomeView, LearnView, MessagesView, MeshView, MembersView, CodeHubView, SettingsView
├── src-tauri/                    # Rust 2021 + Tauri 2 Shell
│   ├── Cargo.toml                # Native dependencies: tauri 2, tauri-plugin-opener, serde
│   ├── tauri.conf.json           # Window dimensions (1280x840 min 960x640), capabilities, security
│   ├── capabilities/             # Fine-grained Tauri security permissions
│   └── src/                      # lib.rs and main.rs Rust entrypoints
└── package.json                  # Scripts & dependencies
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (Node 24 tested)
- Rust toolchain (`rustc`, `cargo`)
- **Windows C++ Build Tools** (Required for native Windows `.exe` linking):
  - Install [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload, or install via winget:
    ```powershell
    winget install Microsoft.VisualStudio.2022.BuildTools --override "--passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
    ```

### Development
To run the desktop application frontend in browser dev mode:
```bash
npm run dev:desktop
```

To run the Tauri 2 desktop shell in development:
```bash
# From workspace root:
npm run desktop

# Or from the desktop/ folder:
cd desktop
npm run desktop
```

### Production Build
```bash
# Build desktop web bundle:
npm run build:desktop

# Build native desktop application installer (.exe / .msi):
cd desktop
npm run desktop:build
```

### Automated Tests
Run unit tests for the CFM1 wire protocol and ChaCha20-Poly1305 cryptography:
```bash
cd desktop
npm test
```
