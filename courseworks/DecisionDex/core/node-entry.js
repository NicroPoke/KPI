const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
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

[
  "dataContract.js",
  "metaData.js",
  "generator.js",
  "memoization.js",
  "priorityQueue.js",
  "asyncUtils.js",
  "streamProcessor.js",
  "events.js",
  "authProxy.js",
  "logger.js",
  "scoringEngine.js",
  "index.js",
].forEach((fileName) => {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  vm.runInContext(source, sandbox, { filename: fileName });
});

module.exports = {
  DecisionDexContract: sandbox.DecisionDexContract,
  DecisionDexMetaData: sandbox.DecisionDexMetaData,
  Generator: sandbox.Generator,
  Memoization: sandbox.Memoization,
  PriorityQueue: sandbox.PriorityQueue,
  AsyncUtils: sandbox.AsyncUtils,
  StreamProcessor: sandbox.StreamProcessor,
  Events: sandbox.Events,
  AuthProxy: sandbox.AuthProxy,
  Logger: sandbox.Logger,
  ScoringEngine: sandbox.ScoringEngine,
  DecisionDexCore: sandbox.DecisionDexCore,
};