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

## Local Usage

No build step or dependencies required — simply open `index.html` in any modern browser.

## Hosting on GitHub Pages

1. Push the repository to GitHub (`main` branch).
2. In your repository on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **`main`** and **`/ (root)`**, then click **Save**.
4. Your map will be live at `https://lechip.github.io/bloodborne-guide/`.

## License

This project is licensed under the [MIT License](LICENSE).
