var Generator = {
  fibonacciGenerator: function* () {
    var first = 0;
    var second = 1;
    while (true) {
      yield first;
      var next = first + second;
      first = second;
      second = next;
    }
  },

  consumeWithTimeout: async function (iterator, timeoutSeconds, iterationDelaySeconds) {
    iterationDelaySeconds = typeof iterationDelaySeconds === "number" ? iterationDelaySeconds : 0.2;

    if (iterationDelaySeconds < 0) {
      throw new Error("iterationDelaySeconds must be >= 0");
    }

    if (timeoutSeconds <= 0) {
      return 0;
    }

    var deadline = Date.now() + timeoutSeconds * 1000;
    var consumedCount = 0;
    var numericCount = 0;
    var numericTotal = 0;

    while (Date.now() < deadline) {
      var result = iterator.next();
      if (result.done) {
        break;
      }

      consumedCount += 1;
      var value = result.value;

      if (typeof value === "number" && Number.isFinite(value)) {
        numericCount += 1;
        numericTotal += value;
        var numericAvg = numericTotal / numericCount;
        console.log(
          "#" +
            consumedCount +
            ": " +
            value +
            " | total=" +
            numericTotal.toFixed(2) +
            ", avg=" +
            numericAvg.toFixed(2)
        );
      } else {
        console.log("#" + consumedCount + ": " + String(value));
      }

      if (iterationDelaySeconds > 0) {
        await new Promise(function (resolve) {
          setTimeout(resolve, iterationDelaySeconds * 1000);
        });
      }
    }

    return consumedCount;
  },

  roundRobin: function* (list) {
    var i = 0;
    while (Array.isArray(list) && list.length > 0) {
      yield list[i % list.length];
      i += 1;
    }
  },
};
