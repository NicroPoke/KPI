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

### 16 April 2026 — Search bar update and article discovery

- Added the header search bar so readers can quickly find articles by title.
- Ranked search results by term matches and limited the dropdown to the most relevant matches.
- Kept navigation in sync so opening a search result updates the current article view immediately.
