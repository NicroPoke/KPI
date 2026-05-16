function EventStream() {
  this._listeners = {
    data: [],
    error: [],
    end: [],
  };
}

EventStream.prototype.on = function (eventName, callback) {
  if (!this._listeners[eventName]) {
    throw new Error("Unsupported event: " + eventName);
  }
  this._listeners[eventName].push(callback);
};

EventStream.prototype.emit = function (eventName, payload) {
  if (!this._listeners[eventName]) {
    throw new Error("Unsupported event: " + eventName);
  }
  this._listeners[eventName].slice().forEach(function (callback) {
    callback(payload);
  });
};

async function* largeNumberStream(totalItems, batchSize, options) {
  batchSize = typeof batchSize === "number" ? batchSize : 10000;
  options = options || {};

  var failOnItem = options.failOnItem == null ? null : options.failOnItem;
  var delaySeconds = options.delaySeconds || 0;

  if (totalItems < 0) {
    throw new Error("totalItems must be >= 0");
  }
  if (batchSize <= 0) {
    throw new Error("batchSize must be > 0");
  }
  if (delaySeconds < 0) {
    throw new Error("delaySeconds must be >= 0");
  }

  var start = 0;
  while (start < totalItems) {
    var end = Math.min(start + batchSize, totalItems);

    if (failOnItem != null && start <= failOnItem && failOnItem < end) {
      throw new Error("Producer failed on item " + failOnItem);
    }

    var batch = [];
    var i;
    for (i = start; i < end; i++) {
      batch.push(i);
    }
    yield batch;
    start = end;

    if (delaySeconds > 0) {
      await new Promise(function (resolve) {
        setTimeout(resolve, delaySeconds * 1000);
      });
    }
  }
}

var StreamProcessor = {
  EventStream: EventStream,
  largeNumberStream: largeNumberStream,

  processNumberBatches: async function (batches) {
    var count = 0;
    var total = 0;
    var minimum = null;
    var maximum = null;

    for await (var batch of batches) {
      var i;
      for (i = 0; i < batch.length; i++) {
        var value = batch[i];
        count += 1;
        total += value;
        minimum = minimum === null ? value : Math.min(minimum, value);
        maximum = maximum === null ? value : Math.max(maximum, value);
      }
    }

    return {
      count: count,
      sum: total,
      min: minimum,
      max: maximum,
      avg: count ? total / count : null,
    };
  },

  streamToEvents: function (producer, eventStream) {
    return (async function () {
      try {
        for await (var batch of producer) {
          eventStream.emit("data", batch);
        }
        eventStream.emit("end", null);
      } catch (err) {
        eventStream.emit("error", err);
        throw err;
      }
    })();
  },

  streamFromEvents: async function* (eventStream) {
    var queue = [];
    var pendingResolve = null;

    function push(eventName, payload) {
      queue.push({ eventName: eventName, payload: payload });
      if (pendingResolve) {
        var resolve = pendingResolve;
        pendingResolve = null;
        resolve();
      }
    }

    eventStream.on("data", function (payload) {
      push("data", payload);
    });
    eventStream.on("error", function (payload) {
      push("error", payload);
    });
    eventStream.on("end", function (payload) {
      push("end", payload);
    });

    while (true) {
      if (queue.length === 0) {
        await new Promise(function (resolve) {
          pendingResolve = resolve;
        });
      }

      var item = queue.shift();
      if (!item) {
        continue;
      }

      if (item.eventName === "data") {
        yield item.payload;
        continue;
      }

      if (item.eventName === "error") {
        throw item.payload;
      }

      break;
    }
  },
};
