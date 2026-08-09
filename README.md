# ⚡ FlowTrack — Study Tracker Pro (Cloud Edition)

> **A premium, cloud-synced study dashboard that visualizes your daily FlowTrack data securely from a Neon PostgreSQL database — with a stunning glassmorphism UI.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Neon Database](https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=black)](https://neon.tech/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [The Study Ecosystem](#-the-study-ecosystem)
- [How It Works (Secure Backend)](#-how-it-works-secure-backend)
- [Premium UI/UX](#-premium-uiux)
- [Deployment & Setup](#-deployment--setup)
- [Views & Screens](#-views--screens)
- [Tech Stack](#-tech-stack)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**FlowTrack — Study Tracker Pro (Cloud Edition)** is a premium read-only dashboard designed to visualize your daily study session data. It is seamlessly integrated with the **Ultimate Master Study Tracker** desktop app.

Instead of manually importing JSON files, this app connects securely to a **Neon Serverless PostgreSQL Database** through a **Cloudflare Pages API**. Your data syncs automatically, safely, and beautifully.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| ☁️ **Direct Cloud Sync** | Fetches live data securely from your Neon PostgreSQL database via a Cloudflare Functions API endpoint |
| 🛡️ **100% Secure Architecture** | The database connection string is stored as a secret environment variable on Cloudflare, so your password is never exposed to the frontend |
| 🎨 **Premium Glassmorphism UI** | Completely redesigned with colorful gradients, deep shadows (`shadow-2xl`), animated backdrops, and Framer Motion interactions |
| 🔄 **Live Data Formatting** | Automatically processes database records into structured Day/Session views for the UI |
| 📊 **Dashboard View** | Quick stats, planned vs actual time, completion ratio, efficiency badge, subject progress bars, and a full session list |
| 🕒 **Timeline View** | Chronological visual timeline with animated status dots, pulse effect for in-progress sessions, and per-session progress bars |
| 📈 **Analytics View** | Performance badge, SVG donut chart (time distribution), animated bar chart (planned vs actual), and per-subject efficiency breakdown |
| 🎵 **JSON-Driven Music Player** | Play YouTube songs from your JSON `ambience_playlist` — draggable PiP video player via React Portal |
| 📱 **Fully Responsive** | Mobile-first design that scales from phones to ultra-wide desktops |

---

## 🌐 The Study Ecosystem

FlowTrack is one piece of a complete study workflow:

| Project | Purpose | Live Demo | Repository |
|---|---|---|---|
| 📸 **Only Study Gallery** | Daily study screenshots & proof gallery | [only-study-gellery.pages.dev](https://only-study-gellery.pages.dev/) | [GitHub](https://github.com/SudhirDevOps1/ONLY-STUDY-GELLERY) |
| 📚 **My All Classes** | Daily class-wise schedule sync dashboard | [my-all-classes.pages.dev](https://my-all-classes.pages.dev/) | [GitHub](https://github.com/SudhirDevOps1/My-All-Classes) |
| ⚡ **Ultimate Master Study Tracker** | Precision timer, gamification & analytics engine | [the-ultimate-master-study-tracker.vercel.app](https://the-ultimate-master-study-tracker.vercel.app/) | [GitHub](https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker) |

---

## ⚙️ How It Works (Secure Backend)

To protect your database from hackers, we removed the insecure frontend database connections. Instead, we use **Cloudflare Pages Functions**.

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. User visits https://my-all-classes.pages.dev/                     │
│ 2. Frontend React app calls `fetch('/api/data')`                     │
│ 3. Cloudflare Pages Function (functions/api/data.ts) runs on server  │
│ 4. Function reads `NEON_DB_URL` secret environment variable securely │
│ 5. Function uses @neondatabase/serverless to query Neon DB directly  │
│ 6. Data is returned to frontend as clean JSON                        │
│ 7. Frontend formats and displays the premium glassmorphism UI        │
└──────────────────────────────────────────────────────────────────────┘
```

Your database credentials remain 100% protected on Cloudflare's edge servers.

---

## 💎 Premium UI/UX

The interface has been upgraded to match the desktop app's premium feel:
- **Container Styling:** `bg-gradient-to-br from-slate-800/60 to-slate-900/60`
- **Glassmorphism:** Heavy use of `backdrop-blur-xl` and `border-white/[0.1]`
- **Deep Shadows:** Vibrant glowing drop-shadows using `shadow-2xl shadow-purple-500/10`, emerald, and blue variants.
- **Animations:** Extensive use of `framer-motion` for spring physics, micro-interactions, and page transitions.

---

## 🚀 Deployment & Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Cloudflare Account**
- **Neon Database**

### 1. Local Development

```bash
# 1. Clone the repository
git clone https://github.com/SudhirDevOps1/My-All-Classes.git
cd My-All-Classes

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Build for production
npm run build
```

*(Note: To test the `/api/data` backend locally, you can use the Cloudflare Wrangler CLI: `npx wrangler pages dev dist`)*

### 2. Deploying to Cloudflare Pages

1. Upload the repository to GitHub.
2. In the Cloudflare Dashboard, go to **Pages** -> **Create a project** -> **Connect to Git**.
3. Select this repository.
4. Set the build command to `npm run build` and output directory to `dist`.
5. **CRITICAL STEP: Set Environment Variables**
   - In Cloudflare Pages, go to **Settings** -> **Environment variables**.
   - Add a variable named **`NEON_DB_URL`**.
   - Paste your Neon PostgreSQL connection string (`postgresql://neondb_owner:password@ep-something.aws.neon.tech/neondb...`).
   - Click **Encrypt** to protect it, then save.
6. Click **Save and Deploy**. Your app will automatically fetch your live data securely!

---

## 🖥️ Views & Screens

### 📊 Dashboard
- **Quick Stats row** — total study time, completion %, session count, efficiency %
- **Stat cards** — planned time, actual time, done ratio, overall progress (with live trend dots)
- **Subject Progress** — animated per-subject completion bars inside premium glowing containers
- **Today's Schedule** — every session with status, times, planned vs actual, and progress

### 🕒 Timeline
- Sessions sorted chronologically along an animated gradient line
- Status-colored dots with a **pulse animation** for in-progress sessions

### 📈 Analytics
- **Performance badge** — dynamic rewards based on efficiency tiers
- **Summary cards** — total sessions, completion rate, overall efficiency
- **Time Distribution** — pure SVG donut chart of planned minutes per subject
- **Subject Details** — per-subject planned, actual, and color-coded efficiency percentage

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Backend API** | Cloudflare Pages Functions (`functions/api/data.ts`) |
| **Database Driver**| `@neondatabase/serverless` |

---

## 👨‍💻 Author

**Sudhir** — [@SudhirDevOps1](https://github.com/SudhirDevOps1)

| | |
|---|---|
| 🌐 Tracker | [the-ultimate-master-study-tracker.vercel.app](https://the-ultimate-master-study-tracker.vercel.app/) |
| 📚 Class Data | [my-all-classes.pages.dev](https://my-all-classes.pages.dev/) |
| 📸 Proof Gallery | [only-study-gellery.pages.dev](https://only-study-gellery.pages.dev/) |

If this project helps you stay consistent, please consider giving it a ⭐ on GitHub!

---

## 📜 License

Free and open-source. Use it, fork it, learn from it, build on it.
