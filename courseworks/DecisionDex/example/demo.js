function demoGenerator() {
  console.log("=== Demo: Generator ===");

  var leads = ["Garchomp", "Dragapult", "Landorus"];
  var gen = Generator.roundRobin(leads);

  console.log("Round-robin prediction order:");
  for (var i = 0; i < 7; i++) {
    var result = gen.next();
    if (!result.done) {
      console.log("  " + (i + 1) + ". " + result.value);
    }
  }

  var rangeGen = Generator.range(1, 100);
  console.log("\nTimeout iterator (100ms budget):");
  var count = Generator.consumeWithTimeout(rangeGen, 100, function (value, idx) {
    if (idx % 20 === 0 || idx < 5) {
      console.log("  Value: " + value);
    }
  });
  console.log("  Processed " + count + " items in timeout");
}

function demoMemoization() {
  console.log("\n=== Demo: Memoization ===");

  var callCount = 0;
  function expensiveTypeCheck(poke1, poke2) {
    callCount++;
    return poke1.type === poke2.type ? "same" : "different";
  }

  var memoized = Memoization.createLRU(expensiveTypeCheck, 100);

  console.log("First call (fire vs grass):");
  var result1 = memoized({ type: "fire" }, { type: "grass" });
  console.log("  Result: " + result1 + ", calls: " + callCount);

  console.log("Second call (fire vs grass) - should be cached:");
  var result2 = memoized({ type: "fire" }, { type: "grass" });
  console.log("  Result: " + result2 + ", calls: " + callCount);
}

function demoPriorityQueue() {
  console.log("\n=== Demo: Priority Queue ===");

  var queue = PriorityQueue.create();

  queue.enqueue("Garchomp", 50);
  queue.enqueue("Dragapult", 30);
  queue.enqueue("Landorus", 40);

  console.log("Dequeue highest priority:");
  console.log("  Lead: " + queue.dequeue("highest"));
  console.log("  Lead: " + queue.dequeue("highest"));
  console.log("  Lead: " + queue.dequeue("highest"));
}

function demoAsyncUtils() {
  console.log("\n=== Demo: Async Utils ===");

  var pokemon = ["Garchomp", "Dragapult", "Landorus"];

  AsyncUtils.asyncMapPromise(pokemon, function (name) {
    return Promise.resolve({ name: name, hp: Math.random() * 100 });
  })
    .then(function (results) {
      console.log("Async map results:");
      results.forEach(function (p) {
        console.log("  " + p.name + ": " + p.hp.toFixed(1) + " HP");
      });
    })
    .catch(function (error) {
      console.error("Error in async map:", error);
    });
}

function demoStreamProcessor() {
  console.log("\n=== Demo: Stream Processor ===");

  var largeData = [];
  for (var i = 0; i < 100; i++) {
    largeData.push("item_" + i);
  }

  var stream = StreamProcessor.createStream(largeData, 20);

  var chunkCount = 0;
  StreamProcessor.processStream(
    stream,
    function (chunk, callback) {
      chunkCount++;
      console.log("  Processing chunk " + chunkCount + " (" + chunk.length + " items)");
      setTimeout(callback, 10);
    },
    function (error, total) {
      if (error) {
        console.error("Stream error:", error);
      } else {
        console.log("  Total items processed: " + total);
      }
    }
  );
}

function demoEvents() {
  console.log("\n=== Demo: Events ===");

  var emitter = Events.createEmitter();

  emitter.subscribe("battle-start", function (data) {
    console.log("Battle started: " + data.opponent);
  });

  emitter.subscribe("team-change", function (data) {
    console.log("Team changed: " + data.pokemon + " switched");
  });

  console.log("Emitting events:");
  emitter.emit("battle-start", { opponent: "Alice" });
  emitter.emit("team-change", { pokemon: "Garchomp" });
}

function demoAuthProxy() {
  console.log("\n=== Demo: Auth Proxy ===");

  var proxy = AuthProxy.createProxy({
    apiKey: "test-key-123",
  });

  console.log("Proxy configured with API key");
  console.log("(Note: fetch example would require network access)");
}

function demoLogger() {
  console.log("\n=== Demo: Logger ===");

  var logger = Logger.createLogger({
    logLevel: "DEBUG",
    logToConsole: true,
    logToJSON: true,
  });

  logger.info("Application started");
  logger.debug("Debug info", { version: "1.0.0" });
  logger.warn("This is a warning", { code: 42 });

  var logs = logger.getLogs();
  console.log("Total logs captured: " + logs.length);
}

console.log("DecisionDex Core Module Examples\n");
demoGenerator();
demoMemoization();
demoPriorityQueue();
demoAsyncUtils();
demoStreamProcessor();
demoEvents();
demoAuthProxy();
demoLogger();
console.log("\n=== Demos Complete ===");
