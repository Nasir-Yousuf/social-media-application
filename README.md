# Pulse518 — Private Course Social Media Platform

**Pulse518** is a private, cohort-exclusive social network built for students in **CS-518: Advanced Web Architecture**. Inspired by the text-first simplicity and focused usability of classic Twitter, Pulse518 delivers an academic community environment with zero algorithmic noise or external ads.

---

## 🌟 Key Features

1. **Course-Gated Registration & Secure Authentication**
   - Private course entry guarded by course invitation passcode (`CS518-2026`).
   - Passwords hashed using `bcryptjs` with salt factor 10.
   - Cryptographically signed JWT tokens with 7-day expiration.
   - Protected route guards on both API and React frontend.

2. **Classic Text-First Feed & Post Composer**
   - 280-character post limit with live radial progress ring.
   - Dynamic tabs: **"All Course"** (chronological course posts + pinned announcements) and **"Following"** (posts from followed classmates).
   - Optimistic Like interaction with micro-animation and instant count updates.
   - Full post edit and deletion permissions strictly enforced (author or faculty admin).

3. **Discussion Threads & Comments**
   - Inline expandable comment sections on every post.
   - Character validation (up to 500 chars) and delete permissions for comment authors or faculty.

4. **Social Graph & Following System**
   - Follow and unfollow classmates with real-time reactive follower/following counts.
   - Interactive modal listing who a student is following and their followers.

5. **Course Members Directory (~35 Enrolled Students)**
   - Pre-seeded with 35 realistic student profiles + 1 instructor admin account.
   - Real-time search by student name, username, or technical bio.
   - Filter by All, Students, and Faculty.

6. **Explore & Unified Search**
   - Trending course topic hashtags (`#React19`, `#MongoDB`, `#Architecture`, `#MidtermPrep`, `#Docker`).
   - Unified search querying across students, usernames, and post discussions.

7. **Faculty Administration & Moderation (`/admin`)**
   - Platform metrics: Total Enrolled, Total Posts, Discussion Comments, and Total Likes.
   - Student roster management (promote to admin, suspend/activate account, remove).
   - Content moderation (force-remove inappropriate posts).
   - Official announcement broadcaster pinned to the top of the course feed.

8. **Design Aesthetics & Responsiveness**
   - Custom Plus Jakarta Sans typography and JetBrains Mono code font.
   - Zinc/slate dark theme with indigo and violet accent hues and glassmorphism.
   - Desktop 3-column layout + mobile-optimized bottom navigation bar and mobile composer.

---

## 🚀 Quick Start Guide

### 1. Requirements
- **Node.js**: v18+ (tested on Node v24.21.0)
- **Database**: Zero-setup embedded MongoDB included out-of-the-box via `mongodb-memory-server`! Alternatively, connect to your own MongoDB Atlas or local MongoDB by setting `MONGODB_URI` in `server/.env`.

### 2. Running Locally
Both backend and frontend can be started with a single command from the project root:

```bash
# Start backend (Port 5180) and frontend (Port 5173) concurrently
npm run dev
```

Or start them individually:

```bash
# In the server directory (Port 5180):
cd server
npm start

# In the client directory (Port 5173):
cd client
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Test Credentials

To facilitate instant testing, 1-click login pills are provided on the login page, or you can log in manually:

| Role | Username / Email | Password | Description |
|---|---|---|---|
| **Student** | `nasir` or `nasir@course518.edu` | `password123` | Student account with existing posts & followers |
| **Student** | `sarah_c` or `sarah@course518.edu` | `password123` | Classmate student account |
| **Faculty Admin** | `dr_vance` or `admin@course518.edu` | `admin123` | Course Instructor with `/admin` dashboard access |

### Registering a New Student:
- Course Invitation Passcode: `CS518-2026`

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with Bearer token request/response interceptors

### Backend
- **Runtime**: Node.js + Express.js 5
- **Database ODM**: Mongoose 8
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Embedded Database**: `mongodb-memory-server` (automatic fallback if no external URI provided)
