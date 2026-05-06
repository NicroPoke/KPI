# DecisionDex

DecisionDex is a browser extension for Opera based on the Chromium engine and Manifest V3, with the option to also ship as a standalone client-side tool for analyzing the opening position in Pokemon Showdown. The project must recommend the optimal lead Pokemon at the start of a match using a fully procedural, deterministic approach with no machine learning.

## Project Purpose

The goal of DecisionDex is to take the player's team, the opponent's preview team, and the selected battle format, then determine the best opening lead and explain why that choice was made.

The system must:

- analyze both sides of the match, including the player's team and the opponent preview;
- infer likely movesets using a static meta table and competitive data;
- evaluate matchups by type, speed, roles, hazard control, bulk, and utility;
- return a ranked list of candidates with reasoning;
- remain deterministic, with no neural networks and no probabilistic learning.

## Target Architecture and Data Contract

DecisionDex must be built as a layered system with a clear data boundary between the browser extension UI, the background coordinator, and the procedural core engine.

### Architecture Layers

- Content Script: reads the current Pokemon Showdown battle state from the page and prepares raw team data.
- Background Script: coordinates messages, manages request flow, and acts as the bridge between the UI and the core logic.
- Popup / Overlay UI: displays the recommendation, candidate ranking, and explanation to the user.
- Core Engine: performs all deterministic scoring, matchup evaluation, memoization, and utility processing.

### Data Flow

1. The content script extracts the player's team, the opponent preview, and any available battle context.
2. The background script receives the extracted data and forwards it to the core engine.
3. The core engine computes candidate scores, predicts likely leads, and produces a ranked result.
4. The UI renders the recommendation and supporting reasoning.

### Input Contract

The core engine must accept a normalized battle payload containing:

- the selected format;
- the player's team;
- the opponent preview team;
- optional meta dataset records;
- optional battle flags such as known lead information or live battle state.

### Output Contract

The core engine must return a deterministic recommendation object containing:

- the best lead candidate;
- a ranked list of all candidates;
- a score breakdown by factor;
- a human-readable explanation;
- any derived predictions used during scoring.

### Integration Rules

- The UI must not calculate battle scores directly.
- The content script must not contain matchup logic beyond extraction and normalization.
- The background script must not own domain scoring rules.
- All scoring formulas and heuristics must live in the core engine.

## Functional Specification

### 1. Battle Engine

#### 1.1 Input Data

- the player's team, including Pokemon, item, ability, and moves;
- the opponent preview team, consisting of Pokemon only;
- the battle format, such as OU or UU;
- optional static meta dataset in JSON format;
- optional data already extracted from the Pokemon Showdown interface.

#### 1.2 Output

- the recommended lead Pokemon;
- a ranked list of all team members by score;
- an explanation that includes:
  - type advantage;
  - speed matchups;
  - hazard control;
  - predicted opponent leads.

#### 1.3 Constraints

- no ML and no neural networks;
- no probabilistic learning models;
- only rule-based heuristics, deterministic scoring, and static datasets.

### 2. Procedural Evaluation Algorithm

Each candidate lead is scored using the following weighted components:

Score = TypeAdvantageScore + SpeedControlScore + HazardScore + AntiLeadScore + BulkSurvivabilityScore + UtilityScore

#### 2.1 Type Advantage

- evaluate type effectiveness using the type chart;
- account for dual typings;
- score important resistances and weaknesses.

#### 2.2 Speed Tier

- compare base speed;
- account for priority moves;
- estimate whether the candidate can move first against common leads.

#### 2.3 Hazard Logic

- reward Stealth Rock and Spikes setters;
- value Defog and Rapid Spin users as utility control;
- measure usefulness in the opening turn.

#### 2.4 Anti-Lead Logic

- Taunt users;
- Fake Out;
- status spreaders;
- disruptive tools against expected lead archetypes.

#### 2.5 Survivability

- defensive stats;
- number of resistances;
- ability to survive common opening sequences.

#### 2.6 Meta Prediction

Use a static lookup table for likely moves and archetypes, updated through JSON data rather than core engine changes.

The logic must be extensible by adding new entries to the lookup data without changing the scoring engine.

## Extension Architecture

### Components

- Content Script, for injecting into the Pokemon Showdown UI and extracting team data;
- Background Script, for coordinating messages, background logic, and data exchange;
- UI Overlay, for showing recommendations, scores, and explanations;
- Core Logic Engine, for modular calculations and utility functions.

### Recommended Repository Structure

The repository should include a modular structure with core utilities, extension code, and an example project. The intended folders are core, extension, and example, with separate modules for generator logic, memoization, priority queueing, async utilities, stream processing, events, authentication proxying, and logging.

The current project already contains the base extension scaffold, including the manifest, background script, content script, and popup UI.

## Technical Tasks 1–9

### Task 1. Generators and Iterators

Implement at least one infinite generator function for cyclic traversal of candidate leads.

Also implement a timeout-based iterator for bounded evaluation of candidates and simulation of multiple matchup scenarios within a fixed time budget.

Use cases include cycling through predicted opponent leads and simulating several matchup scenarios under time constraints.

### Task 2. Project Setup

Prepare the project as a modular repository with documentation and a local dependency for the example project.

Required files include .gitignore, package.json, README.md, and a LICENSE file using MIT or ISC.

Requirements include repository initialization with git init, modular architecture, an example that uses a local library, and documentation for running and understanding the modules.

### Task 3. Memoization System

Implement a memoize API with configurable max size, strategy, and TTL support.

Supported strategies must include LRU, LFU, TTL, and a custom eviction strategy.

Use cases include caching matchup evaluations and type calculations.

### Task 4. Bi-Directional Priority Queue

Implement a bi-directional priority queue with enqueue, dequeue, and peek operations.

Supported modes must include highest, lowest, oldest, and newest.

The implementation should rely on two heaps and a deque to preserve insertion order.

Use case: dynamic ranking of lead candidates.

### Task 5. Async Array Function

The selected function is map.

Implement a callback-based async map, a Promise-based async map, and abort support through AbortController.

Use case: parallel evaluation of matchups.

### Task 6. Large Data Processing

Support large Pokemon-related datasets, including moves and stats, through an async iterator or stream-based pipeline.

The system must support incremental processing of streamed chunks to avoid unnecessary memory pressure.

Use case: staged loading of meta data.

### Task 7. Reactive System

Implement a reactive layer using EventEmitter or Observable with subscribe, unsubscribe, and emit functionality.

Use cases include responding to team changes, battle start events, and recommendation updates.

### Task 8. Authentication Proxy

Implement a request wrapper that can inject API keys, JWTs, and OAuth tokens.

Optional features include token refresh, rate limiting, and logging.

Use case: fetching external meta datasets.

### Task 9. Logging Decorator

Implement a logging decorator that supports input and output logging, async functions, timestamps, execution time, and output in console, file, and JSON formats.

## UI Requirements

### Overlay Panel

The panel must display the recommended lead, candidate scores, and the reasoning behind the result.

### Interaction

The interface must support toggling visibility, refreshing the analysis, and recalculating the result for the current match state.

## Non-Functional Requirements

- deterministic outputs;
- modular design;
- memory efficiency;
- extensible architecture;
- no ML dependencies.

## Deliverables

The final project must include a GitHub repository, a working extension, a demo project, documentation, and example outputs.

## Quick Start in Opera

1. Open opera://extensions.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the project folder.
5. Open the extension popup and run the check or analysis action.

## Next Development Steps

- add icons and the icons field in manifest.json;
- narrow matches and host_permissions to the target domain;
- connect the team extraction logic for Pokemon Showdown;
- implement the core scoring engine and static meta datasets;
- connect popup, background, and content script through message passing;
- prepare the example project and the input format documentation;
- add test scenarios for scoring, memoization, priority queueing, and async utilities.
