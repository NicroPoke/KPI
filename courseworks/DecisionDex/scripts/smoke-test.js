const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = process.cwd();

const files = [
  "core/dataContract.js",
  "core/metaData.js",
  "core/generator.js",
  "core/memoization.js",
  "core/priorityQueue.js",
  "core/asyncUtils.js",
  "core/streamProcessor.js",
  "core/events.js",
  "core/authProxy.js",
  "core/logger.js",
  "core/scoringEngine.js",
  "core/index.js",
];

const sandbox = {
  console,
  Date,
  Math,
  JSON,
  Number,
  String,
  Array,
  Object,
  RegExp,
  Promise,
  Intl,
  URL,
  URLSearchParams,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  AbortController,
  AbortSignal,
};

sandbox.globalThis = sandbox;
sandbox.global = sandbox;
sandbox.self = sandbox;
sandbox.window = sandbox;
sandbox.chrome = { runtime: { onMessage: { addListener() {} } } };

vm.createContext(sandbox);

for (const relative of files) {
  const absolute = path.join(root, relative);
  const source = fs.readFileSync(absolute, "utf8");
  vm.runInContext(source, sandbox, { filename: relative });
}

const payload = sandbox.DecisionDexContract.buildBattlePayload({
  format: "gen9ou",
  source: "smoke-test",
  live: true,
  battleActive: true,
  myTeam: ["Garchomp", "Dragapult", "Landorus-Therian", "Great Tusk", "Kingambit", "Corviknight"],
  enemyTeam: ["Samurott-Hisui", "Ting-Lu", "Iron Valiant", "Rotom-Wash", "Clefable", "Garchomp"],
});

const first = sandbox.ScoringEngine.recommendLead(payload);
const second = sandbox.ScoringEngine.recommendLead(payload);

if (!first.ok) {
  throw new Error(first.error || "recommendLead failed");
}

if (!second.ok) {
  throw new Error(second.error || "Second recommendLead failed");
}

if (first.recommendedLead.id !== second.recommendedLead.id) {
  throw new Error("recommendLead is not deterministic for identical payload");
}

if (first.ranking.length !== 6) {
  throw new Error("Expected ranking length of 6");
}

if (!Array.isArray(first.recommendedLead.reasoning) || first.recommendedLead.reasoning.length === 0) {
  throw new Error("Expected non-empty reasoning list");
}

console.log("Smoke test passed.");
console.log(`Recommended lead: ${first.recommendedLead.name}`);
console.log(`Score: ${first.recommendedLead.score}`);