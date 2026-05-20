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

Labs Overview
--------------

**Lab 1 - Generators and Iterators**
- File: [core/generator.js](core/generator.js)
- Usage: Used by `core/streamProcessor.js` for creating infinite sequences and processing values with timeout mechanisms.

**Lab 2 - Project Setup**
- Files: `package.json`, `pyproject.toml`, `core/package.json`
- Usage: Project structure with local dependencies linking, git initialization, and library organization.

**Lab 3 - Memoization Function**
- File: [core/memoization.js](core/memoization.js)
- Usage: Wraps pure functions to cache results; used throughout core modules to optimize repeated calculations in scoring engine.

**Lab 4 - Bi-Directional Priority Queue**
- File: [core/priorityQueue.js](core/priorityQueue.js)
- Usage: Implements efficient priority-based element retrieval; used in `core/scoringEngine.js` for ranking Pokémon candidates.

**Lab 5 - Async Array Function Variants**
- File: [core/asyncUtils.js](core/asyncUtils.js)
- Usage: Provides callback-based and Promise-based async array operations; used for handling async battle team processing and score aggregation.

**Lab 6 - Large Data Processing with Streams/Async Iterators**
- File: [core/streamProcessor.js](core/streamProcessor.js)
- Usage: Processes large battle datasets incrementally; consumed by `background.js` for live battle monitoring with MutationObserver.

**Lab 7 - Reactive Communication with Observables/EventEmitters**
- File: [core/events.js](core/events.js)
- Usage: Implements event-driven communication; used for inter-module messaging (GET_BATTLE_TEAMS, LIVE_BATTLE_TEAMS_UPDATE) and popup-background coordination.

**Lab 8 - Authentication Proxy for API Service**
- File: [core/authProxy.js](core/authProxy.js)
- Usage: Intercepts and injects authentication headers; used by extension to authenticate API requests and handle token renewal for external services.

**Lab 9 - Logging Decorator with Configurable Log Levels**
- File: [core/logger.js](core/logger.js)
- Usage: Decorates functions with INFO/DEBUG/ERROR logging; used throughout core modules for request/response logging and execution profiling.


