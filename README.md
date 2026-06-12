# ⚡ FlowTrack — Study Tracker Pro

> **A premium, read-only study dashboard that visualizes your daily FlowTrack JSON exports — with zero data modification, guaranteed.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-Open_Source-success)](#-license)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [The Study Ecosystem](#-the-study-ecosystem)
- [How It Works](#-how-it-works)
- [JSON Data Format](#-json-data-format)
- [Adding Daily Data](#-adding-daily-data)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Views & Screens](#-views--screens)
- [Tech Stack](#-tech-stack)
- [WebConnect P2P Sync](#-webconnect-p2p-sync)
- [Design Philosophy](#-design-philosophy)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**FlowTrack — Study Tracker Pro** is a strictly **read-only** dashboard for visualizing daily study session data exported from the [Ultimate Master Study Tracker](https://the-ultimate-master-study-tracker.vercel.app/). 

Drop your daily JSON exports into the `public/data/` directory (named by date, e.g. `12-06-2026.json`), and the app **automatically scans, loads, and renders** them — beautifully.

### Why Read-Only?

The data displayed here is the **source of truth** exported by the tracker app. This dashboard never edits, mutates, or rewrites session data. What's in the JSON is **exactly** what you see — planned minutes, actual seconds, statuses, notes, tags, and timestamps.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗂️ **Auto JSON Scanning** | Automatically discovers and loads all date-named JSON files from `public/data/` via a manifest, with a hardcoded fallback list |
| 📅 **Smart Date Selection** | Auto-selects **today's** data on load; falls back to yesterday, then the most recent available date |
| ⏮️⏭️ **Date Navigation** | Previous / Next / Today buttons plus a sidebar listing every available date |
| 📊 **Dashboard View** | Quick stats, planned vs actual time, completion ratio, efficiency badge, subject progress bars, and a full session list |
| 🕒 **Timeline View** | Chronological visual timeline with animated status dots, pulse effect for in-progress sessions, and per-session progress bars |
| 📈 **Analytics View** | Performance badge, Pie chart (time distribution), Bar chart (planned vs actual), and per-subject efficiency breakdown |
| 🔍 **Session Detail Modal** | Click any session to inspect every field — times, progress, notes, tags, IDs, and timestamps |
| 📥 **Import JSON** | Drag-and-drop or paste a FlowTrack export to view it instantly (persisted in `localStorage`, source files untouched) |
| 📤 **Export JSON** | Download the currently displayed day's data as `DD-MM-YYYY.json` |
| 🔄 **Rescan** | One-click cache clear + fresh re-scan of the data directory |
| 🌐 **WebConnect P2P** | Optional peer-to-peer sync across devices (no signaling server needed) |
| 🎨 **Premium UI/UX** | Glassmorphism, animated gradient orbs, floating particles, and Framer Motion micro-interactions throughout |
| 📱 **Fully Responsive** | Mobile-first design that scales gracefully from phones to ultra-wide desktops |
| 🔒 **Privacy-First** | 100% client-side — no servers, no telemetry, no tracking |

---

## 🌐 The Study Ecosystem

FlowTrack is one piece of a complete, **free and open-source** study workflow:

| Project | Purpose | Live Demo | Repository |
|---|---|---|---|
| 📸 **Only Study Gallery** | Daily study screenshots & proof gallery | [only-study-gellery.pages.dev](https://only-study-gellery.pages.dev/) | [GitHub](https://github.com/SudhirDevOps1/ONLY-STUDY-GELLERY) |
| 📚 **My All Classes** | Daily class-wise schedule JSON data | [my-all-classes.pages.dev](https://my-all-classes.pages.dev/) | [GitHub](https://github.com/SudhirDevOps1/My-All-Classes) |
| ⚡ **Ultimate Master Study Tracker** | Precision timer, gamification & analytics engine | [the-ultimate-master-study-tracker.vercel.app](https://the-ultimate-master-study-tracker.vercel.app/) | [GitHub](https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker) |

**Workflow:** Track sessions in the *Ultimate Master Study Tracker* → export daily JSON to *My All Classes* → capture screenshot proof in *Only Study Gallery* → visualize everything here in **FlowTrack**.

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App boots → fetches /data/file-manifest.json             │
│ 2. Scans every listed JSON file in parallel                 │
│ 3. Caches successful fetches in localStorage                │
│ 4. Merges: imported data > cached data > bundled samples    │
│ 5. Auto-selects today → yesterday → most recent date        │
│ 6. Renders the selected day across 3 views (read-only)      │
└─────────────────────────────────────────────────────────────┘
```

**Data priority order** (highest first):

1. **User-imported data** (`localStorage`, key `flowtrack_DD-MM-YYYY`)
2. **Cached fetched files** (`localStorage`, key `flowtrack_cache_DD-MM-YYYY`)
3. **Bundled sample data** (compiled into the app)

---

## 📄 JSON Data Format

Each daily file follows the official FlowTrack export schema:

```json
{
  "app": "FlowTrack",
  "exportedAt": "2026-06-12T07:41:07.014Z",
  "subjects": [
    {
      "id": "ai_ml_001",
      "name": "AI / ML Study",
      "color": "#9C27B0",
      "createdAt": "2026-06-12T07:00:00.000Z"
    }
  ],
  "sessions": [
    {
      "id": "session_ai_1",
      "subjectId": "ai_ml_001",
      "startTime": "2026-06-12T04:45:00.000Z",
      "endTime": "2026-06-12T06:45:00.000Z",
      "plannedMinutes": 120,
      "actualSeconds": 16,
      "colorTag": "#9C27B0",
      "notes": "AI/ML study: theory + coding practice (2 hours)",
      "tags": ["focus"],
      "status": "completed",
      "createdAt": "2026-06-12T07:00:00.000Z",
      "updatedAt": "2026-06-12T07:39:46.202Z",
      "manualEntry": false,
      "seriesId": null,
      "parentSessionId": null,
      "recurrence": null
    }
  ]
}
```

### Supported Session Statuses

| Status | Meaning | Indicator |
|---|---|---|
| `planned` | Scheduled, not started | ⏳ Blue |
| `in_progress` / `in-progress` | Currently running (both spellings handled) | 🔄 Yellow (pulsing) |
| `completed` | Finished | ✅ Green |
| `skipped` | Skipped | ⏭️ Gray |

---

## ➕ Adding Daily Data

1. **Export** your day's JSON from the [Ultimate Master Study Tracker](https://the-ultimate-master-study-tracker.vercel.app/).
2. **Name it by date** — supported formats:
   - `12-06-2026.json` *(DD-MM-YYYY — recommended)*
   - `12/06/2026.json` *(DD/MM/YYYY)*
3. **Place it** in `public/data/`.
4. **Done!** The app auto-discovers it — no manifest editing needed.

> 🔄 **How auto-scan works:** On load, the app scans **90 days back + 14 days forward** from today (104 candidate dates). It tries fetching `DD-MM-YYYY.json` for each date in parallel batches of 20. Existing files load instantly, missing ones fail silently. Results are cached in `localStorage` for offline use.

> 💡 **Optional manifest:** If you want faster loading, you can optionally maintain `public/data/file-manifest.json` — the app reads it first as a fast path. But it is **not required** anymore.

> 💡 **No file access?** Use the **Import** button instead — drag-and-drop or paste your JSON and it persists in your browser's `localStorage`.

---

## 📁 Project Structure

```
flowtrack/
├── public/
│   └── data/                      # 📂 Daily JSON exports live here
│       ├── file-manifest.json     # Registry of available data files
│       ├── 11-06-2026.json        # Sample: all sessions completed
│       ├── 12-06-2026.json        # Sample: mixed statuses (real export)
│       ├── 13-06-2026.json        # Sample: all sessions planned
│       └── 14-06-2026.json        # Sample: weekend deep-focus plan
├── src/
│   ├── App.tsx                    # Root component — scanning, routing, state
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind + custom scrollbar & utilities
│   ├── components/
│   │   ├── AnimatedBackground.tsx # Gradient orbs + particles + grid
│   │   ├── Dashboard.tsx          # Stats cards, progress, session list
│   │   ├── Timeline.tsx           # Chronological session timeline
│   │   ├── Analytics.tsx          # Recharts pie/bar + efficiency cards
│   │   ├── Sidebar.tsx            # Date list + view navigation
│   │   ├── SessionDetailModal.tsx # Full session inspector (read-only)
│   │   ├── QuickStats.tsx         # Compact 4-stat summary row
│   │   ├── ImportModal.tsx        # Drag-and-drop / paste JSON importer
│   │   └── Footer.tsx             # Ecosystem links + credits
│   ├── data/
│   │   ├── sampleData.ts          # Bundled fallback sample days
│   │   └── fileList.ts            # Fallback scan list (no manifest)
│   ├── types/
│   │   └── index.ts               # Subject, StudySession, DayData, DayStats
│   └── utils/
│       ├── dateUtils.ts           # Date formatting, parsing, durations
│       ├── statsUtils.ts          # Aggregations + status normalization
│       └── cn.ts                  # Tailwind class merge helper
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SudhirDevOps1/The-Ultimate-Master-Study-Tracker.git
cd The-Ultimate-Master-Study-Tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build
npm run preview
```

The production build outputs a **single self-contained `dist/index.html`** (via `vite-plugin-singlefile`) — deploy it anywhere: Cloudflare Pages, Vercel, Netlify, GitHub Pages, or even open it from disk.

---

## 🖥️ Views & Screens

### 📊 Dashboard
- **Quick Stats row** — total study time, completion %, session count, efficiency %
- **Stat cards** — planned time, actual time, done ratio, overall progress (with live trend dots)
- **Efficiency badge** — dynamic encouragement based on your performance
- **Currently Active / Up Next** — highlighted cards for the running and upcoming sessions
- **Subject Progress** — animated per-subject completion bars
- **Today's Schedule** — every session with status, times, planned vs actual, and progress; click any row for full details

### 🕒 Timeline
- Sessions sorted chronologically along an animated gradient line
- Status-colored dots with a **pulse animation** for in-progress sessions
- Per-session cards with progress bars and a status legend

### 📈 Analytics
- **Performance badge** — 🏆 / 🌟 / 👍 / 💪 / 🚀 based on efficiency tiers
- **Time Distribution** — donut chart of planned minutes per subject
- **Planned vs Actual** — grouped bar chart comparison
- **Subject Details** — per-subject planned, actual, and color-coded efficiency

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) + [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Dates** | [date-fns](https://date-fns.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🌐 WebConnect P2P Serverless Sync — Official API Integration

FlowTrack includes built-in **WebConnect** integration for true serverless multi-device peer-to-peer synchronization using the official [webConnect.js](https://webconnect.js.org/) library.

### 🔧 How to Enable (Official API)

```typescript
// Enable in src/App.tsx — line ~48
const { isConnected, peerCount, broadcast, sendToPeer, ping } = useWebConnect({
  enabled: true, // ← Change false to true to enable mesh network
  options: {
    appName: 'flowtrack',      // Your app identity
    channelName: 'study-sync'  // Channel name for peer discovery
  }
});
```

### 📱 Mobile & Small Screen Access
The P2P status button is **fully accessible on all screen sizes** (mobile phones, tablets, desktops):
- **Interactive Guide Button:** Look for **`📶 P2P Guide`** or **`📶 X peers`** in the top header.
- **Tap to Open Guide:** Opens the comprehensive **WebConnect Interactive Guide Modal** with real-time connection status, step-by-step setup instructions, and technical details.

### ⚙️ How Serverless WebConnect Works (Official Docs)
Based on [webConnect.js official API](https://webconnect.js.org/#api-connect-to-a-channel):

1. **No Signaling Server Required** — Unlike traditional WebRTC apps that need a centralized WebSocket server for peer discovery, webConnect.js uses **decentralized public protocols**:
   - **BitTorrent DHT** (Distributed Hash Table)
   - **MQTT** (Message Queuing Telemetry Transport brokers)
   - **NOSTR** (Decentralized relay network)

2. **Auto Mesh Discovery** — Once peers discover each other via these protocols, browsers establish direct encrypted WebRTC data channels automatically.

3. **Works on Static Hosting** — Your FlowTrack dashboard can run on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or even `localhost` and still sync across devices.

### 📚 Official API Reference

| Method | Description | Official Docs |
|--------|-------------|---------------|
| `webconnect(options)` | Initialize with `appName`, `channelName`, etc. | [Connect to Channel](https://webconnect.js.org/#api-connect-to-a-channel) |
| `onConnect(attr)` | Listen for new peer connections | [Listen on Connect](https://webconnect.js.org/#listen-to-every-new-connection) |
| `onDisconnect(attr)` | Listen for peer disconnections | [Listen on Disconnect](https://webconnect.js.org/#listen-to-every-disconnection) |
| `onReceive(data, attr)` | Receive data from peers | [Listen on Receive](https://webconnect.js.org/#listen-to-receiving-data) |
| `Send(data, {connectId})` | Send to specific peer (or `null` for broadcast) | [Send Data](https://webconnect.js.org/#send-data-to-connection) |
| `getConnection(callback)` | Get all peer IDs in channel | [Get All Connections](https://webconnect.js.org/#get-all-connection-identity-in-the-channel) |
| `Ping({connectId})` | Get latency to peer (ms) | [Ping Connection](https://webconnect.js.org/#get-latency-of-connection) |
| `Disconnect()` | Leave the channel | [Disconnect](https://webconnect.js.org/#disconnect-from-channel) |

### ⚠️ Technical Limitations & Best Practices

1. **Active Foreground Tab Required:** WebRTC data channels require browsers to remain open and active in the foreground. Mobile OS (iOS/Android) freezes network sockets when tabs are minimized or backgrounded.

2. **Strict Firewalls / Corporate NATs:** Very strict enterprise, university, or public NATs/firewalls may block direct UDP peer-to-peer communication. If public STUN servers cannot traverse symmetric NATs, connections may fail.

3. **Lightweight Data Recommended:** WebRTC data channels are optimized for lightweight JSON state sync or small messages. Avoid sending very large binary blobs in a single `Send()` call.

4. **Channel Isolation:** Peers only discover others using the **same `appName` + `channelName`** combination. Use unique channel names for different user groups if needed.

---

## 🎨 Design Philosophy

1. **Strict Read-Only** — The JSON is the single source of truth. The UI never mutates session data; every number on screen maps 1:1 to a field in the export.
2. **Glassmorphism Depth** — Translucent panels, backdrop blur, and animated gradient orbs create depth without distraction.
3. **Motion with Meaning** — Every animation (staggered entries, progress fills, pulse effects) communicates state, never decoration for its own sake.
4. **Mobile-First** — Layouts, tap targets, and typography scale from a 320px phone to a 4K monitor.
5. **Zero Backend** — Everything runs in the browser. Your study data never leaves your machine.

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

---

<p align="center">
  Built with ❤️ for learners worldwide — <strong>make every second count.</strong>
</p>
