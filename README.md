# Clearfeed — The Anti-Algorithm Social Platform

> **"Unfiltered. Chronological. Yours."**  
> A minimalist social platform built for thinkers, writers, and software developers. Text, code, and substance — free from engagement manipulation, vanity impression metrics, and algorithmic frenzy.

---

## 🌿 Philosophy & Principles

| What Clearfeed Avoids                   | Why                                                | What Clearfeed Embraces                                                  |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| ❌ **Algorithmic feed sorting**         | Feeds that optimize for rage/engagement trap users | ✅ **100% Chronological timeline** with explicit "No Algorithm" badge    |
| ❌ **Endless infinite scroll**          | Encourages compulsive doomscrolling                | ✅ **Deliberate pagination** ("Load earlier posts") so you can stop      |
| ❌ **Impression counts / View metrics** | Triggers vanity anxiety                            | ✅ **Quiet interaction**: Appreciate, Respond, Boost, and Bookmark       |
| ❌ **Image-heavy attention noise**      | Drowns out substantive discourse                   | ✅ **Text & Code only** (tiny profile avatars auto-compressed ≤100KB)    |
| ❌ **280-character soundbites**         | Limits nuanced thought                             | ✅ **2,000-character limit** with serif typography for book-like reading |

---

## 🌟 Core Features

1. **Warm & Earthy Minimalist Design System**
   - Warm paper and charcoal palette (no corporate social media blue).
   - Serif typography (`Source Serif 4`) for post body text designed for reading.
   - Sans-serif navigation (`Inter`) and monospace code font (`JetBrains Mono`).
   - Seamless **Light & Dark mode** toggle with persistent local storage.

2. **VS Code Multi-File Snippet Studio**
   - Tabbed editor mirroring the Visual Studio Code interface.
   - Share multi-file projects (HTML, CSS, JS, Python, SQL, React, etc.).
   - Full syntax highlighting, line numbers, and file icons.
   - **Fork / Remix**: 1-click fork snippets from any post into your composer with attribution.

3. **Markdown-Enhanced Posts**
   - Write posts with **bold**, _italic_, `inline code`, [links](url), and bullet lists.
   - Zero-dependency safe inline markdown rendering.

4. **Private Bookmarks & Reading List**
   - Privately save posts and code snippets to your `/bookmarks` collection.
   - Toggle bookmark with one click directly from any post card.

5. **Self-Contained Avatar Storage (Zero Cloud Storage Cost)**
   - Client-side HTML5 canvas compression resizes photos to 128×128 JPEG (≤100KB).
   - Stored directly as binary `Buffer` inside MongoDB.
   - Served via `GET /api/users/:id/avatar` with 24-hour HTTP cache headers.
   - Free tier compatible: 500 users take only ~25MB of MongoDB Atlas's 512MB free tier.

6. **Weekly Digest (`/digest`)**
   - A calm overview of the thoughts, workspaces, and discussions from the past 7 days.

7. **Centered Single-Column Architecture**
   - Clean horizontal top navigation bar replacing distracting left/right sidebars.
   - Optimal reading column width (`max-w-2xl` / 672px).
   - Compact mobile bottom navigation.

8. **Open Community**
   - Direct, open signup without invitation passcodes.
   - Member status line (e.g. `🔨 Building a compiler`).
   - Community directory with search and role filters.

---

## 🚀 Quick Start Guide

### 1. Requirements

- **Node.js**: v18+ (tested on Node v24)
- **Database**: Zero-setup embedded MongoDB included out-of-the-box via `mongodb-memory-server`! Alternatively, connect to your own MongoDB Atlas cluster by setting `MONGODB_URI` in `server/.env`.

### 2. Running Locally

Start both backend (port 5180) and frontend (port 5173) with a single command from the project root:

```bash
npm run dev
```

Or run each service individually:

```bash
# Backend (Port 5180):
cd server
npm run dev

# Frontend (Port 5173):
cd client
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Accounts

1-click login buttons are available on the sign-in page:

| Account   | Username | Password      | Role             |
| --------- | -------- | ------------- | ---------------- |
| **Nasir** | `nasir`  | `password123` | Community Member |

Or create any new account directly via `/register`.

---

## 🌐 100% Free Hosting Deployment

Clearfeed is specifically engineered to run completely free across standard cloud tiers without requiring paid storage services (like AWS S3 or Cloudinary):

| Component       | Recommended Platform                           | Free Tier Specifications                                          |
| --------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| **Database**    | [MongoDB Atlas](https://www.mongodb.com/atlas) | Free Shared M0 Cluster (512MB storage, automated backups)         |
| **Backend API** | [Railway](https://railway.app) / [Render](https://render.com) | Node.js web service runtime                     |
| **Frontend UI** | [Vercel](https://vercel.com)                   | Free Hobby Plan (Edge CDN, unlimited preview & production builds) |

### Deploying the Backend on Railway / Render:

1. Connect your GitHub repository to Railway or Render.
2. Create a new **Web Service**.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5180`
   - `JWT_SECRET`: `<any-secure-random-string>`
   - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`

### Deploying the Frontend on Vercel:

1. Import your GitHub repository to Vercel.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Set Environment Variable:
   - `VITE_API_URL`: `https://clearfeed518.up.railway.app` (or your deployed backend URL)
5. Deploy.

## 📱 React Native Mobile Application (`mobile/`)

Clearfeed also includes a full native mobile app built with **React Native + Expo**, featuring Twitter's exact dark aesthetic, full gesture navigation, and native offline storage.

### 🌟 Mobile Features

- **Twitter "Lights Out" Aesthetic**: Pure black `#000000` background, card surfaces `#16181c`, borders `#2f3336`, Twitter blue `#1d9bf0`, like pink `#f91880`, retweet green `#00ba7c`, and verified gold `#ffd700`.
- **Chronological Feed**: Pull-to-refresh (`RefreshControl`), infinite scrolling, "All Feed" vs "Following" pill tabs.
- **VS Code Multi-File Snippet Block**: Tabbed code viewer with line numbers, monospace typography, and 1-tap copy to clipboard via `expo-clipboard`.
- **Interactive Action Bar**: Like heart animation, retweet, bookmarks, threaded replies, and native OS share dialog.
- **2000-Character Composer**: Numeric character counter, staff controls (announcement & pinned posts), and multi-tab code project builder.
- **Avatar Photo Picker**: Pick photos directly from camera roll via `expo-image-picker`, compressed under 100KB and stored as binary in the database.
- **Configurable Backend Host**: 1-tap setting to connect physical phones (via Wi-Fi IP) or emulators (`10.0.2.2`).

### 🚀 Running the Mobile App

From the project root:

```bash
# Start the Expo development server:
npm run mobile

# Or inside the mobile/ directory:
cd mobile
npm start
```

Press:

- **`a`** to open in Android Emulator
- **`i`** to open in iOS Simulator (macOS)
- **`w`** to open in Web browser
- Or scan the terminal QR code with the **Expo Go** app on your physical iOS or Android device!

---

## 🛠️ Tech Stack

- **Web Frontend**: React 19, Vite 8, Tailwind CSS v4, Vanilla CSS tokens, Lucide React, Date-fns, React Router DOM v7
- **Mobile App**: React Native 0.86, Expo SDK 57, React Navigation v7 (Bottom Tabs + Native Stack), AsyncStorage, Expo Image Picker, Expo Clipboard, Date-fns
- **Backend API**: Node.js, Express.js 5, Mongoose 8, JWT, bcryptjs, Morgan
- **Storage**: In-database binary buffers for avatars (zero S3/blob costs)
