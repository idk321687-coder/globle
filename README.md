# GLOBLE 🌍 - 3D Mystery Geography Game

A modern, high-performance web clone of the popular geography game **Globle** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Three.js / Globe.gl**.

Guess the mystery country of the day with distance-based heat feedback rendered directly onto an interactive 3D globe!

---

## ✨ Features

- **Interactive 3D Globe**:
  - Smooth WebGL globe powered by `globe.gl` and `Three.js`.
  - Realistic Earth satellite imagery (Blue Marble) and Dark Minimalist styles.
  - Atmosphere glow and 3D country polygons with elevation highlighting.
  - Full touch and mouse controls: drag to rotate, pinch/scroll to zoom, tap/click polygons to inspect.
  - Floating controls: Zoom In, Zoom Out, Compass (Reset View), and Auto-Rotation toggle.
  - Automatic cinematic fly-to animation centering on newly guessed countries.

- **Globle Proximity & Heat Feedback**:
  - Accurate great-circle distance calculated via the **Haversine formula** between country centroids.
  - Exact Globle heat map palette:
    - 🎯 **Target Country**: Bright Emerald Green (`#10b981`)
    - 🔥 **Extremely Close (< 1,000 km)**: Deep Ruby / Crimson Red (`#c62828`)
    - 🟠 **Very Close (1,000 – 2,500 km)**: Bright Red-Orange (`#e64a19`)
    - 🟡 **Close (2,500 – 5,000 km)**: Vibrant Orange (`#fb8c00`)
    - 🌾 **Moderate (5,000 – 8,000 km)**: Yellow-Orange / Warm Amber (`#fbc02d`)
    - ❄️ **Far (> 8,000 km)**: Pale Yellow or Beige (`#fef08a`)
  - Compass bearing arrows indicating direction toward the target (e.g. `↗ NE`, `↓ S`).

- **Game Modes**:
  - **Daily Mode**: Synchronized to UTC midnight. Uses a deterministic seeded PRNG so players worldwide guess the same mystery country each day.
  - **Practice / Unlimited Mode**: Play unlimited randomized rounds to hone geography knowledge.

- **Intelligent Autocomplete Input**:
  - Fast search with alias matching (e.g., `USA` → United States, `UK` → United Kingdom, `Czech Republic` → Czechia, `UAE` → United Arab Emirates, `DRC` → DR Congo).
  - Full keyboard accessibility: Arrow Up/Down navigation, Enter to submit, Escape to dismiss.

- **Stats, Persistence & Sharing**:
  - `localStorage` persistence saves daily progress, statistics, streaks, and preferences.
  - Guess distribution histogram.
  - Confetti celebration upon winning.
  - Wordle-style copyable emoji summary to share on social media.
  - Web Audio synthesizer providing pleasant sound clues and victory fanfare without external audio files.

---

## 🚀 Quick Start (PNPM)

### 1. Install Dependencies
```bash
cd globle
pnpm install
```

### 2. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
pnpm build
pnpm start
```

---

## 📁 Project Structure

```
globle/
├── public/
│   ├── datasets/
│   │   └── countries.geojson      # Cleaned 50m Natural Earth polygons
│   └── textures/
│       ├── earth-blue-marble.jpg  # Satellite Earth texture
│       └── earth-dark.jpg         # Dark minimalist Earth texture
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind CSS and scrollbar styling
│   │   ├── layout.tsx             # Root layout and metadata
│   │   └── page.tsx               # Main game page and orchestrator
│   ├── components/
│   │   ├── CountryInput.tsx       # Search autocomplete with alias matching
│   │   ├── GlobeView.tsx          # 3D interactive Globe canvas & shaders
│   │   ├── GuessesDashboard.tsx   # Closest guess banner & guesses list
│   │   ├── Header.tsx             # Navigation, game mode toggle & actions
│   │   ├── HeatLegend.tsx         # Distance bracket color scale
│   │   ├── HelpModal.tsx          # Rules and instructions
│   │   ├── SettingsModal.tsx      # KM/Miles, themes, rotation, sound
│   │   ├── StatsModal.tsx         # Win rate, streaks, distribution chart
│   │   └── VictoryModal.tsx       # Confetti, countdown & score sharing
│   ├── data/
│   │   └── countries.json         # 242 countries metadata, centroids & aliases
│   ├── lib/
│   │   ├── audio.ts               # Web Audio API sound synthesizer
│   │   ├── gameEngine.ts          # Daily seeding PRNG, search, share text
│   │   ├── geo.ts                 # Haversine distance, bearings & heat colors
│   │   └── storage.ts             # localStorage state & stats manager
│   └── types/
│       └── index.ts               # TypeScript data models and interfaces
└── scripts/
    ├── generate-data.js           # GeoJSON cleaner and metadata builder
    └── verify-game.js             # Automated verification test suite
```
