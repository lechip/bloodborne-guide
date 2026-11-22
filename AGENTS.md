# AGENTS.md — Bloodborne Progression Map

Guidance for AI coding agents working in this repository.

## Project Overview

An interactive, spoiler-light HTML/SVG progression guide for **Bloodborne** and **The Old Hunters** DLC, modeled after the Fextralife Game Progress Route.

- **Repository:** `https://github.com/lechip/bloodborne-guide`
- **Live Hosting:** GitHub Pages from `main` (`/ (root)`) → `https://lechip.github.io/bloodborne-guide/`

## Architecture & Constraints

- **Zero-Build Static Site:** The app must work both on GitHub Pages (HTTP) **and** when opened directly via `file://` in a browser. Do **not** introduce a build step, bundler, or `<script type="module">` (which fails under `file://` CORS) unless explicitly requested.
- **Modular Structure:** Keep code split by single responsibility under `css/` and `js/` using the `window.BloodborneMap` namespace:
  - `index.html` — Markup shell, SVG layers, and script/style entry point.
  - `css/theme.css` — CSS custom properties, typography, reset, and atmospheric backdrop.
  - `css/hud.css` — Top header, filters, search dropdown, legend, zoom bar, and overlay popover.
  - `css/map.css` — SVG phase frames, directed paths, animations, and node cards.
  - `css/drawer.css` — Hunter's Journal detail panel and path cards.
  - `css/responsive.css` — Tablet and mobile (`<= 768px`) bottom-sheet and touch layout.
  - `js/data.js` — Progression graph data (`worldBounds`, `overlayConfig`, `phases`, `nodes`, `edges`).
  - `js/state.js` — Central state, graph adjacency maps, and `localStorage` progress persistence.
  - `js/renderer.js` — SVG rendering, highlight states, and dynamic text fitting.
  - `js/camera.js` — Mouse pan/wheel zoom, 1-finger touch drag, 2-finger pinch-to-zoom, and framing.
  - `js/drawer.js` — Hunter's Journal drawer UI and mobile swipe-down dismissal.
  - `js/hud.js` — Filters, search, route order toggle, progress counter, and map overlay controls.
  - `js/main.js` — Module wiring and initialization.
- **Future Map Overlay Readiness:** Preserve world-space coordinates in `js/data.js` and the `<g id="overlay-layer">` inside `#world-group` so a Yharnam map image can be aligned behind the logical node graph without refactoring.

## Design & Content Guidelines

- **Spoiler-Light Copy:** Keep node labels and Hunter's Journal summaries brief and focused on navigation (area/boss name, key item/trigger, suggested Blood Level, next reachable paths). Avoid story/lore spoilers.
- **Numbering System:** Maintain clear numbering for nodes (`01`–`12`, optional branches `01a`, `04a`–`04c`, etc., DLC `D1`–`D4`, `D3a`), paths (`P01`–`P25`, `PD1`–`PD5`), and Fextralife recommended route order (`#1`–`#25`).
- **Visual Theme & Palette:**
  - Dark gothic Bloodborne atmosphere: sooty raven-black (`#08090a`), misty sage-verdigris fog (`#96a89e` / `#5b6e66`), piercing Blood Moon crimson (`#f5222d` / `#c91822`), warm candlelit tower amber (`#e6b85c`), and misty deep teal (`#589ba3` / `#92dce0`) for DLC.
  - **No Embedded Artwork:** Do not commit or embed external/copyrighted reference images into the codebase; achieve atmosphere with CSS gradients and SVG.
- **Typography:**
  - Display / headings / node titles: `IM Fell English SC`
  - Body / subtitles / UI controls: `Cormorant Garamond`
- **Visual State Clarity:**
  - **Completed nodes** must remain unmistakably distinct from optional/secondary nodes: emerald fill (`#0c1d14`), bright emerald border/accent (`#38b86a` / `#5ce08d`), checkmark seal, and title strikethrough.
  - **Optional nodes** use cooler stone-slate (`#546066`) to avoid hue overlap with completed nodes.
- **No SVG Text Overflow:** Fit node titles and subtitles using `getComputedTextLength()` (and re-run on `document.fonts.ready`) rather than fixed character-count truncation.
- **Mobile-First Ergonomics:**
  - Maintain 1-finger touch pan, 2-finger pinch-to-zoom, and drag-threshold filtering so taps on nodes don't conflict with panning.
  - On viewports `<= 768px`, render the Hunter's Journal as a bottom sheet with swipe-down dismissal, center tapped nodes in the upper visible half, keep mobile search input at `16px` (prevents iOS auto-zoom), and respect `env(safe-area-inset-*)`.

## Git & Commit Conventions

- **Conventional Commits:** All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - Format: `<type>(<optional scope>): <short imperative summary>`
  - Common types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `perf`
  - Examples:
    - `feat(mobile): add pinch-to-zoom and bottom sheet drawer`
    - `fix(map): prevent SVG node text overflow after webfont load`
    - `style(theme): refine completed node emerald contrast`
    - `refactor: split monolith into modular css/ and js/ files`
    - `docs: add AGENTS.md with project conventions`
- **Review Before Pushing:** For visual, theme, or major structural changes, keep changes local for user preview and wait for approval before pushing to `origin/main` unless the user explicitly asks to commit and push.
