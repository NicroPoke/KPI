# RainyWiki

RainyWiki is a small WikiFandom-like coursework project built with Vue.

## Structure

- `src/` — application source code
- `src/App.vue` — root component
- `src/main.js` — entry point
- `index.html` — HTML template
- `vite.config.js` — Vite configuration

## Run

From `courseworks/RainyWiki` folder:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Recent Changes

### 15 March 2026 — Content expansion and article coverage

- Added full standalone wiki-style articles for Ghosted Away and Freaky Golf.
- Linked RainyForecast game subsection entries to dedicated article pages.
- Added return links from individual game articles back to RainyForecast.

### 15 March 2026 — Navigation and data architecture update

- Implemented functional Random article navigation in the header.
- Migrated article storage from JavaScript to `src/data/articles.json`.
- Refined article content by removing control-description blocks from game pages.
- Enabled automatic infobox image sizing for responsive rendering.
### Current development cycle — Core RainyWiki foundation

- Built a Vite + Vue single-page interface for a custom RainyWiki layout.
- Implemented AppHeader, WikiArticle, and animated rain background effects.
- Established component structure to support additional articles and sections.
