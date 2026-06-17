# FlowTrack: Detailed Developer Guide & Code Architecture

Welcome to the comprehensive development guide for **FlowTrack**. This guide is designed to provide developers with an in-depth understanding of the directory structure, component hierarchy, logic flow, recent updates, and instructions on how to expand or customize the application.

---

## Table of Contents
1. [Project Overview & Technology Stack](#1-project-overview--technology-stack)
2. [Folder & Directory Structure](#2-folder--directory-structure)
3. [File-by-File Code Breakdown](#3-file-by-file-code-breakdown)
4. [Recent Critical Code Changes & Explanations](#4-recent-critical-code-changes--explanations)
5. [How-To Guides: Customizing & Modifying the App](#5-how-to-guides-customizing--modifying-the-app)
6. [Data Schema & Parsing Logic](#6-data-schema--parsing-logic)
7. [Troubleshooting & Bug Prevention Rules](#7-troubleshooting--bug-prevention-rules)

---

## 1. Project Overview & Technology Stack

**FlowTrack** is a client-side Study Tracking Web Application designed to load and analyze daily study sessions. It runs entirely on the browser and can compile down to a **single inline HTML file** for portable usage.

### Tech Stack:
- **Core Framework**: React 19 (TypeScript)
- **Bundler & Tooling**: Vite 7
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

## 2. Folder & Directory Structure

Here is a visual map of the workspace:

```text
My-All-Classes-main/
│
├── public/                     # Static assets served directly
│   └── data/                   # Study data JSON files
│       ├── 17-06-2026.json     # Sample cumulative JSON export
│       └── file-manifest.json  # Auto-generated manifest of available JSON files
│
├── src/                        # Main source code
│   ├── components/             # React visual UI components
│   │   ├── Analytics.tsx       # Graphs, donut segment charts, stats
│   │   ├── AnimatedBackground.tsx # Fluid ambient grid background animation
│   │   ├── Dashboard.tsx       # Main stats, session highlights, user profile banner
│   │   ├── ErrorBoundary.tsx   # Recovers UI on crashes
│   │   ├── Footer.tsx          # Copyright & build metadata
│   │   ├── ImportModal.tsx     # JSON drag-and-drop importer
│   │   ├── AmbiencePlayer.tsx  # JSON-driven YouTube music player with draggable PiP (React Portal)
│   │   ├── QuickStats.tsx      # Cards showing study totals, streaks
│   │   ├── SessionDetailModal.tsx # Information pop-up for clicking study items
│   │   ├── Sidebar.tsx         # Date list, view mode toggles, User Profile
│   │   ├── Timeline.tsx        # Vertical chronological study roadmap
│   │   └── WebConnectGuideModal.tsx # P2P Sync help documentation
│   │
│   ├── data/                   # Bundled code-side fallback data
│   │   ├── fileList.ts         # Static filenames fallback list
│   │   └── sampleData.ts       # Code fallback mock JSON
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useWebConnect.ts    # WebConnect peer-to-peer sync driver
│   │
│   ├── types/                  # TypeScript Interface contracts
│   │   └── index.ts            # Subject, Session, DayData, ViewMode
│   │
│   ├── utils/                  # Core logic helpers
│   │   ├── cn.ts               # Tailwinds class merger
│   │   ├── dateUtils.ts        # String formatting, durations, progresses
│   │   └── statsUtils.ts       # Math logic for calculation & breakdown
│   │
│   ├── App.tsx                 # Core App controller, fetch drivers, routing
│   ├── index.css               # Base Tailwind imports & CSS animations
│   └── main.tsx                # App bootstrap mounting
│
├── scripts/                    # Development helper automation
│   └── generate-manifest.mjs   # Node utility to write file-manifest.json
│
├── package.json                # Project dependencies and script scripts
├── tsconfig.json               # TypeScript compiler config
└── vite.config.ts              # Vite server configuration & custom plugins
```

---

## 3. File-by-File Code Breakdown

### A. Core Driver Files

#### 1. [`vite.config.ts`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/vite.config.ts)
- **Role**: Builds and configures the environment. Integrates React, Tailwind, and compiles single-file HTML distributions using `vite-plugin-singlefile`.
- **Manifest Plugin**: Hosts a custom Vite server plugin that watches the `public/data/` folder. Whenever `.json` files are added or deleted, it automatically triggers a Node directory read to update `file-manifest.json` on the fly.
- **What to change**: Add or adjust build configurations, aliases, or configure additional dev server watchers.

#### 2. [`src/App.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/App.tsx)
- **Role**: The main central brain. Manages app state, parses JSON structures, calculates study streaks, coordinates P2P syncing, and drives overall UI rendering.
- **Key States**:
  - `currentDate`: The selected date currently visible.
  - `loadedDates`: Key-value cache dictionary matching `"DD-MM-YYYY"` with corresponding `DayData`.
  - `availableDates`: Chronological list of dates possessing study records.
  - `streak`: Consecutive study day counter.
  - `userProfile`: Parsed name, profession, and target settings from loaded JSON.
  - `playlist`: List of YouTube ambient tracks.
- **What to change**: Fetch timeouts, fallback base URLs, routing layouts, or header elements.

---

### B. Core UI Components (`src/components/`)

#### 1. [`Sidebar.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/Sidebar.tsx)
- **Role**: Renders the sliding drawer for mobile devices and sidebar on desktop. Houses route controls, list of loaded dates, and the **User Profile** card.
- **What to change**: Modify sidebar navigation links, adjust list styling, or change the default user avatar icon gradient.

#### 2. [`Dashboard.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/Dashboard.tsx)
- **Role**: The main landing page. Displays the `QuickStats` row, subject progress bars, currently active/upcoming classes, and the **Focus Ambience Playlist** section.
- **What to change**: Layout order of cards, play button design, or progress bar speeds.

#### 3. [`Analytics.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/Analytics.tsx)
- **Role**: Visual performance evaluation screen. Hosts custom SVG charts:
  - **Donut Chart**: Visualizes study time distribution across subjects. Expands and shows sub-segment data on hover.
  - **Bar Chart**: Side-by-side comparison of planned time vs actual study time with custom glow styling.
- **What to change**: Chart dimensions, segment coloring logic, hover speed transitions, or tooltip placements.

#### 4. [`Timeline.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/Timeline.tsx)
- **Role**: Renders an chronological checklist timeline of study sessions from early morning to night.
- **What to change**: Vertical timeline connecting line color, dot symbols, or layout spacing.

#### 5. [`AmbiencePlayer.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/AmbiencePlayer.tsx)
- **Role**: JSON-driven YouTube music player. Reads `ambience_playlist` from JSON settings and renders a fully functional music control bar in the header.
- **Key Features**:
  - Play/Pause, Next Track, Volume slider, and dropdown track selector
  - **Draggable PiP (Picture-in-Picture)** YouTube video card rendered via **React `createPortal`** directly to `<body>` — this is critical because the header uses `backdrop-blur` which creates a CSS transform context that breaks `position: fixed` on children
  - YouTube video ID extraction from various URL formats (`youtu.be`, `youtube.com/watch`, etc.)
  - Shows "No Playlist in JSON" if no tracks are available
- **What to change**: PiP dimensions, drag constraints, track display format, or YouTube embed parameters.

---

### C. Logic Utilities (`src/utils/`)

#### 1. [`dateUtils.ts`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/utils/dateUtils.ts)
- **Role**: Handles date transformations. Formats strings for filename parsing, parses relative labels (Today/Yesterday/Tomorrow), and converts actual seconds or planned minutes to clean reading text (e.g. `2h 15m`).
- **What to change**: Time/date string formats or duration abbreviation preferences.

#### 2. [`statsUtils.ts`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/utils/statsUtils.ts)
- **Role**: The mathematics engine. Aggregates daily statistics, handles subject breakdowns, filters completed sessions, and finds active/upcoming classes.
- **What to change**: Status normalization rules, threshold ratios for class alerts, or subject progress formula coefficients.

---

## 4. Recent Critical Code Changes & Explanations

### 1. Dynamic File Scanning & Directory Watcher
- **Problem**: Previously, App.tsx had a hardcoded date range generation loop (scanning 90 days back to 14 days ahead, sending over 100 fake network requests to the server).
- **Solution**: We removed the 105-day fallback generator. We added `manifestPlugin` inside `vite.config.ts` which automatically scans `public/data/` folder and compiles a unified `file-manifest.json`. The app now queries this manifest file directly, needing only **one single query** to fetch exactly what files exist.

### 2. Multi-Day Session Extraction & Auto-Grouping
- **Problem**: Single JSON files (like `17-06-2026.json`) had study session records for multiple dates (12, 15, 16, 17 June), but the app only registered the date matching the filename, hiding data for the other days.
- **Solution**: Implemented `registerDayDataGroups` inside `App.tsx` which parses the loaded JSON, groups sessions based on their actual date, creates virtual `DayData` objects for each date, and automatically adds all discovered days to the sidebar.

### 3. Smart Dynamic Navigation Lock
- **Problem**: We previously blocked navigating past today, but this prevented users from selecting future dates that actually had pre-planned classes.
- **Solution**: Created `getLatestAllowedDate` which compares Today with the latest date containing data. Users can now freely navigate up to Today, and if the JSON contains future dates (e.g., June 20), they can navigate to that date, but not beyond.

### 4. User Profile & Playlist Visual Widgets
- **Problem**: Useful profile settings and audio play configurations were buried inside the raw settings of the JSON export file.
- **Solution**: Designed the Sidebar User Profile block and the Dashboard Focus Ambience Playlist grid to render profile goals and playlists directly.

### 5. React Portal for PiP Music Player
- **Problem**: The AmbiencePlayer component lives inside `<header>`, which has `backdrop-blur-2xl`. CSS spec dictates that `backdrop-blur` (via `filter` or `backdrop-filter`) creates a new **containing block** for `position: fixed` children — meaning `fixed` behaves like `absolute` relative to the header, not the viewport. This caused the PiP video card to appear stuck behind/above the navbar instead of at the intended bottom-right corner.
- **Solution**: Used React's `createPortal(element, document.body)` to render the PiP video card directly on `<body>`, completely escaping the header's transform context. The PiP now correctly uses viewport-relative `fixed` positioning.

### 6. Settings Data Preservation in Multi-Date Parsing
- **Problem**: When `registerDayDataGroups` grouped sessions by date into virtual `DayData` objects, it only copied `app`, `exportedAt`, `subjects`, and `sessions` — but not `settings`. This meant `ambience_playlist` and `user_profile` were silently dropped, causing the music player to show "No Playlist in JSON" and the profile to fall back to defaults.
- **Solution**: Added `settings: data.settings` to the `datesMap` object creation in `registerDayDataGroups`, ensuring settings persist through the multi-date parsing pipeline.

### 7. Raw Settings Hidden from UI
- **Problem**: The Dashboard displayed a "Raw Settings Configuration" section showing all JSON settings as raw key-value pairs (including API keys, timer state, and internal config) — which was ugly and exposed internal data.
- **Solution**: Removed the raw settings grid while keeping only the clean "Source App" and "Exported At" metadata fields.

---

## 5. How-To Guides: Customizing & Modifying the App

### A. How to Add a New Theme Mode
1. Open [`index.css`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/index.css).
2. FlowTrack uses Tailwind variables. Look at how `--color-theme` variables are applied.
3. You can define custom variables and map them inside `App.tsx` whenever a specific theme setting is retrieved.

### B. How to Add a New Motivational Quote
1. Open [`src/App.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/App.tsx).
2. Locate the `MOTIVATIONAL_QUOTES` array (around lines 73-82).
3. Insert a new item:
   ```typescript
   { text: "Your custom motivational quote here", author: "Author Name" }
   ```

### C. How to Add a New Icon/Stat Card to Dashboard
1. Open [`src/components/Dashboard.tsx`](file:///e:/daily/my%20all%20classes/My-All-Classes-main%20(2)/My-All-Classes-main/src/components/Dashboard.tsx).
2. Inside the main rendering block, find the `StatCard` tags.
3. Insert a new card, providing the desired Lucide icon, label, and computed value.

---

## 6. Data Schema & Parsing Logic

Each date file dropped into `public/data/` or imported by the user follows this schema contract:

```json
{
  "app": "FlowTrack",
  "exportedAt": "2026-06-17T11:49:46.872Z",
  "subjects": [
    {
      "id": "subject_id_001",
      "name": "Subject Name",
      "color": "#HEXCODE",
      "createdAt": "ISO_DATE_STRING"
    }
  ],
  "sessions": [
    {
      "id": "unique-session-uuid",
      "subjectId": "subject_id_001",
      "startTime": "ISO_DATE_STRING",
      "endTime": "ISO_DATE_STRING",
      "plannedMinutes": 120,
      "actualSeconds": 3600,
      "colorTag": "#HEXCODE",
      "notes": "Description notes",
      "status": "completed",
      "createdAt": "ISO_DATE_STRING",
      "updatedAt": "ISO_DATE_STRING",
      "manualEntry": false
    }
  ],
  "settings": [
    {
      "key": "user_profile",
      "value": "{\"name\":\"User Name\",\"age\":\"21\",\"profession\":\"Bca\",\"goal\":\"Hacking\"}"
    }
  ]
}
```

---

## 7. Troubleshooting & Bug Prevention Rules

1. **Keep Imports Relative**: Always resolve import assets using standard relative syntax (`./` or `../`).
2. **Defensive Parsing**: Always run validation tests on timestamps fetched externally. Validate with `!isNaN(new Date(value).getTime())` before using.
3. **Single File Compatibility**: Avoid using dynamic import paths inside runtime logic because the bundle must compile into a single static file using `vite-plugin-singlefile`.
4. **Local Storage Limits**: Keep cached payloads optimal. Deduplicate files and clean out CACHE prefixes during major re-scans.
5. **Portal-Based Fixed Positioning**: If any `fixed`-positioned element appears inside a parent with `backdrop-blur`, `transform`, or `filter`, it will NOT be viewport-relative. Use `createPortal(element, document.body)` to escape.
6. **Settings Preservation**: When grouping multi-date sessions in `registerDayDataGroups`, always copy `data.settings` into the virtual `DayData` object — otherwise JSON settings (playlist, profile, theme) will be silently dropped.
