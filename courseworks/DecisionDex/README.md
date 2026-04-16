# DecisionDex

DecisionDex extension for Opera (Chromium engine, Manifest V3).

## What's inside

- `manifest.json` - extension configuration.
- `background.js` - service worker.
- `content.js` - content script for all pages.
- `popup/` - popup UI.

## Quick start in Opera

1. Open `opera://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked".
4. Select the project folder.
5. Open the extension popup and click the check button.

## Next steps

- Add icons and the `icons` field in `manifest.json`.
- Restrict `matches` and `host_permissions` for your target domain.
- Add your business logic to `content.js` and `background.js`.
