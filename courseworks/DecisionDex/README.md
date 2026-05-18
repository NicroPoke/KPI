DecisionDex
===========

Overview
--------
DecisionDex is a lightweight Chromium/Opera extension that recommends an optimal lead Pokémon for Pokémon Showdown. It uses a deterministic rule-based scoring engine to evaluate both teams and produce a ranked recommendation with brief reasons.

Quick Start
-----------

To load the extension for manual testing: open `chrome://extensions` (or `opera://extensions`), enable Developer mode and load the project folder (entry: `manifest.json`).

Usage
-----
1. Open a Pokémon Showdown battle.
2. Click the DecisionDex extension icon.
3. Press `Refresh` for a one-time scan, or enable `Auto` for live updates.
4. The popup shows: your team, the opponent team, recommended lead, and short reasons.

Architecture (short)
--------------------
- `content.js` — extracts battle state from the page and sends it to the background.
- `background.js` — coordinates tabs, calls `ScoringEngine`, and serves popup requests.
- `popup/` — user interface.
- `core/` — pure logic (data contract, scoring engine, utilities). Usable in Node via `core/node-entry.js`.

Core Modules
------------
- `core/dataContract.js` — payload format and message types.
- `core/scoringEngine.js` — deterministic lead selection logic.
- Utilities in `core/` (asyncUtils, memoization, priorityQueue).

Messaging
---------
- `GET_BATTLE_TEAMS`: request snapshot from content → background.
- `GET_LEAD_RECOMMENDATION`: compute recommendation (background).
- `ENABLE_AUTO_BATTLE_WATCH` / `DISABLE_AUTO_BATTLE_WATCH`: toggle live updates.
- `LIVE_BATTLE_TEAMS_UPDATE`: content → background live payloads.

Scoring summary
---------------
- Each candidate is scored on metrics: type advantage, speed control, hazard value, bulk, utility.
- Scores are aggregated against likely opponent leads; the highest total is recommended.
- Reasons are generated from metric thresholds.


