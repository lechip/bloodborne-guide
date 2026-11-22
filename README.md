# Bloodborne — Hunter's Progression Map

An interactive, spoiler-light HTML node map for navigating **Bloodborne** and **The Old Hunters** DLC, modeled after the Fextralife Game Progress Route.

**Live Site (GitHub Pages):** https://lechip.github.io/bloodborne-guide/

## Features

- **Interactive Node & Path Graph:** Click any node (e.g., `02 · Father Gascoigne`, `03 · Cathedral Ward`, `05 · Vicar Amelia`) to illuminate all reachable next paths and inspect unlock requirements in the **Hunter's Journal** panel.
- **Numbered Progression:**
  - Nodes are coded by route & branch (`01`–`12`, optional branches `01a`, `04a`–`04c`, `07a`–`07b`, `09a`, `11a`, and DLC `D1`–`D4`, `D3a`).
  - Paths are numbered (`P01`–`P25`, `PD1`–`PD5`).
  - Toggle **Route Order** in the header to display Fextralife's recommended step order (`#1`–`#25`).
- **Spoiler-Light Design:** Concise area/boss labels, key items, and suggested Blood Levels without story spoilers.
- **Playthrough Checklist:** Mark nodes as completed; progress is saved locally in `localStorage`.
- **Filters & Search:** Filter by `All`, `Main`, `Optional`, or `DLC`, and search by boss, area, or node code.
- **Future Map Overlay Ready:** Includes a **Map Overlay** tool to load a Yharnam map image behind the SVG node graph with adjustable opacity and scale.

## Project Structure

```
├── index.html          # Main entry point & SVG map shell
├── css/
│   ├── theme.css       # Color palette, fonts, reset & atmospheric backdrop
│   ├── hud.css         # Top bar, filters, search, legend, zoom & overlay controls
│   ├── map.css         # SVG phase frames, paths, animations & node cards
│   ├── drawer.css      # Hunter's Journal detail panel & path cards
│   └── responsive.css  # Tablet & mobile bottom-sheet / touch layout
└── js/
    ├── data.js         # Progression nodes, numbered paths & phase definitions
    ├── state.js        # Central state, adjacency maps & localStorage persistence
    ├── renderer.js     # SVG rendering & active/completed highlight states
    ├── camera.js       # Pan, wheel zoom, touch drag & pinch-to-zoom
    ├── drawer.js       # Hunter's Journal UI & mobile swipe-to-dismiss
    ├── hud.js          # Filters, search dropdown, route order & overlay controls
    └── main.js         # App bootstrap & module wiring
```

## Local Usage

No build step or dependencies required — simply open `index.html` in any modern browser.
