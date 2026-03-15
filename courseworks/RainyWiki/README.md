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

### 15 March 2026 — Wiki article system refactor

- Reworked article rendering to a data-driven structure for easier content replacement.
- Added support for passing a full article object as component input.
- Updated the RainyForecast article to use structured sections and reusable metadata blocks.

### 15 March 2026 — Visual content update

- Connected `RainyWiki.png` from the public assets as the main infobox image.
- Adjusted infobox image styling for consistent display across screen sizes.

### 14–15 March 2026 — Content and writing pass

- Replaced placeholder text with a complete encyclopedia-style article.
- Standardized the page in English with a neutral, wiki-like tone.
- Added game-related release context and project descriptions for the RainyForecast profile.

### Current development cycle — Core RainyWiki foundation

- Built a Vite + Vue single-page interface for a custom RainyWiki layout.
- Implemented AppHeader, WikiArticle, and animated rain background effects.
- Established component structure to support additional articles and sections.
