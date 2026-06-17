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
- [Adding Daily Data (Zero Config)](#-adding-daily-data-zero-config)
- [JSON Data Format](#-json-data-format)
- [Multi-Date Session Filtering](#-multi-date-session-filtering)
- [Auto-Refresh & Live Discovery](#-auto-refresh--live-discovery)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Views & Screens](#-views--screens)
- [Tech Stack](#-tech-stack)

- [Design Philosophy](#-design-philosophy)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**FlowTrack — Study Tracker Pro** is a strictly **read-only** dashboard for visualizing daily study session data exported from the [Ultimate Master Study Tracker](https://the-ultimate-master-study-tracker.vercel.app/).

**Just drop your daily JSON exports into `public/data/`** (named by date, e.g. `16-06-2026.json`) and the app **automatically discovers, fetches, filters, and renders** them — beautifully. No code changes, no manifest editing, no config files to touch.

### Why Read-Only?

The data displayed here is the **source of truth** exported by the tracker app. This dashboard never edits, mutates, or rewrites session data. What's in the JSON is **exactly** what you see — planned minutes, actual seconds, statuses, notes, tags, and timestamps.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗂️ **Zero-Config Auto Discovery** | Drop `DD-MM-YYYY.json` in `public/data/` — auto-discovered within 60 seconds, no manifest or config needed |
| 🔄 **Live Auto-Refresh** | Background polling every 60s + instant re-scan on tab focus — new files appear automatically |
| 🧹 **Multi-Date Session Filtering** | JSON files with sessions from multiple dates are auto-filtered to show only the selected day's sessions |
| 📅 **Smart Date Selection** | Auto-selects **today's** data on load; falls back to yesterday, then the most recent available date |
| ⏮️⏭️ **Date Navigation** | Previous / Next / Today buttons plus a sidebar listing every available date |
| 📊 **Dashboard View** | Quick stats, planned vs actual time, completion ratio, efficiency badge, subject progress bars, and a full session list |
| 🕒 **Timeline View** | Chronological visual timeline with animated status dots, pulse effect for in-progress sessions, and per-session progress bars |
| 📈 **Analytics View** | Performance badge, SVG donut chart (time distribution), animated bar chart (planned vs actual), and per-subject efficiency breakdown |
| 🔍 **Session Detail Modal** | Click any session to inspect every field — times, progress, notes, tags, IDs, and timestamps |
| 📥 **Import JSON** | Drag-and-drop or paste a FlowTrack export to view it instantly (persisted in `localStorage`, source files untouched) |
| 📤 **Export JSON** | Download the currently displayed day's data as `DD-MM-YYYY.json` |
| 🔁 **Rescan** | One-click cache clear + fresh re-scan of the entire data directory |

| 🎨 **Premium UI/UX** | Glassmorphism, animated gradient orbs, floating particles, and Framer Motion micro-interactions |
| 📱 **Fully Responsive** | Mobile-first design that scales from phones to ultra-wide desktops |
| 🔒 **Privacy-First** | 100% client-side — no servers, no telemetry, no tracking |
| ⚡ **Single-File Build** | Production build outputs one self-contained `index.html` (~490KB) — deploy anywhere |

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
┌──────────────────────────────────────────────────────────────────────┐
│ 1. App boots → generates all DD-MM-YYYY.json filenames              │
│    (90 days back → 14 days forward = ~105 candidates)                │
│ 2. Fetches /data/file-manifest.json for known files (fast path)     │
│ 3. Tries fetching EVERY candidate in parallel batches of 20         │
│ 4. Successful files cached in localStorage for offline use           │
│ 5. Auto-selects today → yesterday → most recent available date      │
│ 6. Filters sessions by date (handles multi-date JSON files)         │
│ 7. Renders the selected day across 3 views (read-only)              │
│ 8. Background poll every 60s + tab focus → discovers new files      │
└──────────────────────────────────────────────────────────────────────┘
```

**Data priority order** (highest first):

1. **Live server fetch** — fresh data from `/data/DD-MM-YYYY.json` (always tried first)
2. **User-imported data** — `localStorage`, key `flowtrack_DD-MM-YYYY`
3. **Cached fetched data** — `localStorage`, key `flowtrack_cache_DD-MM-YYYY`
4. **Bundled sample data** — compiled into the app (empty by default, optional)

---

## ➕ Adding Daily Data (Zero Config)

### The Simple Way (Recommended)

1. **Export** your day's JSON from the [Ultimate Master Study Tracker](https://the-ultimate-master-study-tracker.vercel.app/).
2. **Name it** `DD-MM-YYYY.json` (e.g. `16-06-2026.json`).
3. **Drop it** in `public/data/`.
4. **Done!** The app discovers it automatically within 60 seconds — or click the **Rescan** button for instant discovery.

> **That's it.** No `fileList.ts` editing, no `file-manifest.json` updates, no `sampleData.ts` changes. Zero config.

### How Auto-Discovery Works

On every page load, the app:

1. **Generates** all possible `DD-MM-YYYY.json` filenames from **90 days back to 14 days ahead** (~105 candidates)
2. **Fetches** `file-manifest.json` for any additionally listed files
3. **Tries fetching** every candidate in parallel batches of 20
4. **Caches** successful results in `localStorage` for instant offline loading
5. **Silently rescans** every 60 seconds in the background
6. **Instantly rescans** when you switch back to the browser tab

Missing files fail silently. New files appear in the sidebar automatically.

### Optional: Faster Loading with Manifest

If you want the fastest possible initial load, you can optionally run:

```bash
node scripts/generate-manifest.mjs
```

This creates `public/data/file-manifest.json` listing all available files. The app reads it as a fast-path hint. But it is **never required** — the auto-scan finds everything regardless.

### Import via UI (No File Access)

If you can't add files to the project (e.g. using the deployed version), use the **Import** button in the header — drag-and-drop or paste your JSON. It persists in your browser's `localStorage`.

---

## 📄 JSON Data Format

Each daily file follows the official FlowTrack export schema:

```json
{
  "app": "FlowTrack",
  "exportedAt": "2026-06-16T06:28:40.666Z",
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
      "id": "7493d3ef-c9b9-478f-81b2-47ee7e2ba6a0",
      "subjectId": "assignment_004",
      "startTime": "2026-06-16T12:45:00.000Z",
      "endTime": "2026-06-16T14:45:00.000Z",
      "plannedMinutes": 120,
      "actualSeconds": 100,
      "colorTag": "#F44336",
      "notes": "Assignment / Exam preparation: complete pending tasks",
      "tags": ["focus"],
      "status": "completed",
      "createdAt": "2026-06-16T06:22:46.220Z",
      "updatedAt": "2026-06-16T06:25:38.271Z",
      "manualEntry": false
    }
  ],
  "settings": [
    { "key": "theme", "value": "forest" },
    { "key": "pomodoroMode", "value": "true" }
  ]
}
```

### Supported Fields

| Field | Required | Description |
|---|---|---|
| `app` | ✅ | App identifier |
| `exportedAt` | ✅ | ISO 8601 export timestamp |
| `subjects` | ✅ | Array of subject definitions |
| `sessions` | ✅ | Array of study sessions |
| `settings` | ❌ Optional | App settings (key-value pairs) |
| `seriesId` | ❌ Optional | Recurring series ID |
| `parentSessionId` | ❌ Optional | Parent session for recurring |
| `recurrence` | ❌ Optional | Recurrence rule |

### Supported Session Statuses

| Status | Meaning | Indicator |
|---|---|---|
| `planned` | Scheduled, not started | ⏳ Blue |
| `in_progress` / `in-progress` | Currently running (both spellings handled) | 🔄 Yellow (pulsing) |
| `completed` | Finished | ✅ Green |
| `skipped` | Skipped | ⏭️ Gray |

---

## 🔀 Multi-Date Session Filtering

Real FlowTrack exports may contain sessions from **multiple dates** in a single JSON file (e.g. `16-06-2026.json` might include leftover sessions from June 12 and 15).

**FlowTrack handles this automatically:**

- When loading data for a specific date, the app **filters sessions** by their `startTime`
- Only sessions whose `startTime` falls on the selected date are displayed
- Both **local timezone** and **UTC** matching are used for timezone-safe filtering
- Stats, charts, and session counts all reflect only the filtered date's sessions

**Example:** A file with 15 sessions across June 12, 15, and 16 → viewing June 16 shows exactly 5 sessions.

---

## 🔄 Auto-Refresh & Live Discovery

FlowTrack continuously watches for new data files:

| Trigger | Behavior |
|---|---|
| **Page load** | Full scan of ~105 candidate dates + manifest |
| **Every 60 seconds** | Silent background scan for new files only |
| **Tab focus** | Instant background re-scan when you switch back to the tab |
| **Rescan button** | Clears cache + full re-scan of all candidates |
| **Date navigation** | Always tries a fresh live fetch before falling back to cache |

New files appear in the **sidebar** automatically — no refresh needed.

---

## 📁 Project Structure

```
flowtrack/
├── public/
│   └── data/                      # 📂 Drop your DD-MM-YYYY.json files here
│       ├── file-manifest.json     # Optional: auto-generated file registry
│       ├── 11-06-2026.json        # Your study data (auto-discovered)
│       ├── 12-06-2026.json        # Your study data (auto-discovered)
│       ├── 16-06-2026.json        # Multi-date export (auto-filtered)
│       └── ...                    # Any DD-MM-YYYY.json (auto-discovered)
├── src/
│   ├── App.tsx                    # Root — scanning, filtering, routing, state
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind + custom scrollbar & utilities
│   ├── components/
│   │   ├── AnimatedBackground.tsx # Gradient orbs + particles + grid
│   │   ├── Dashboard.tsx          # Stats cards, progress bars, session list
│   │   ├── Timeline.tsx           # Chronological session timeline
│   │   ├── Analytics.tsx          # SVG donut + CSS bar charts + efficiency
│   │   ├── Sidebar.tsx            # Date list + view navigation
│   │   ├── SessionDetailModal.tsx # Full session inspector (read-only)
│   │   ├── QuickStats.tsx         # Compact 4-stat summary row
│   │   ├── ImportModal.tsx        # Drag-and-drop / paste JSON importer
│   │   ├── ErrorBoundary.tsx      # Graceful error handling per view

│   │   └── Footer.tsx             # Ecosystem links + credits
│   ├── data/
│   │   ├── sampleData.ts          # Optional bundled fallback (empty by default)
│   │   └── fileList.ts            # Optional fallback list (empty by default)

│   ├── types/
│   │   └── index.ts               # Subject, StudySession, DayData, DayStats
│   └── utils/
│       ├── dateUtils.ts           # Date formatting, parsing, durations
│       ├── statsUtils.ts          # Aggregations + status normalization
│       └── cn.ts                  # Tailwind class merge helper
├── scripts/
│   └── generate-manifest.mjs      # Optional: generates file-manifest.json
├── .gitignore                     # GitHub ignore rules
├── index.html                     # Entry HTML
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SudhirDevOps1/My-All-Classes.git
cd My-All-Classes

# 2. Install dependencies
npm install

# 3. Start the dev server (hot reload)
npm run dev

# 4. Build for production (single HTML file)
npm run build

# 5. Preview the production build locally
npm run preview
```

### Adding Your Data

```bash
# Just drop your JSON files — that's it!
cp ~/exports/16-06-2026.json public/data/

# The app discovers it automatically within 60 seconds
# Or click the Rescan button for instant discovery
```

---

## 🌍 Deployment

### Single-File Build

The production build outputs a **single self-contained `dist/index.html`** (~490KB) via `vite-plugin-singlefile`. The `dist/data/` folder contains your JSON files.

### Deploy to Cloudflare Pages

```bash
npm run build
# Upload the entire dist/ folder to Cloudflare Pages
# Or connect your GitHub repo for auto-deploy
```

### Deploy to Vercel

```bash
npm run build
# Deploy dist/ folder, or use the vercel CLI:
npx vercel --prod
```

### Deploy to GitHub Pages

```bash
npm run build
# Push dist/ contents to gh-pages branch
```

### Deploy to Netlify

```bash
npm run build
# Drag dist/ folder to Netlify dashboard
```

### Run from Disk

```bash
# Just open dist/index.html in any browser — works offline!
open dist/index.html
```

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
- **Performance badge** — 🏆 / 🌟 / 👍 / 💪 / 🚀 based on efficiency tiers (≥90%, ≥75%, ≥60%, ≥40%, <40%)
- **Summary cards** — total sessions, completion rate, overall efficiency
- **Time Distribution** — pure SVG donut chart of planned minutes per subject with custom legend
- **Planned vs Actual** — animated CSS bar chart comparison per subject
- **Subject Details** — per-subject planned, actual, and color-coded efficiency percentage

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) + [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | Pure SVG (donut) + CSS animated bars — zero chart library dependencies |
| **Dates** | [date-fns](https://date-fns.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---



## 🎨 Design Philosophy

1. **Strict Read-Only** — The JSON is the single source of truth. The UI never mutates session data; every number on screen maps 1:1 to a field in the export
2. **Zero-Config Data** — Drop a file, it appears. No manifests, no config, no code changes
3. **Glassmorphism Depth** — Translucent panels, backdrop blur, and animated gradient orbs create depth without distraction
4. **Motion With Meaning** — Every animation communicates state, never decoration for its own sake
5. **Mobile-First** — Layouts, tap targets, and typography scale from 320px phone to 4K monitor
6. **Zero Backend** — Everything runs in the browser. Your study data never leaves your machine

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
