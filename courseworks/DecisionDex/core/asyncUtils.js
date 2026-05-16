function AbortError(message) {
  this.name = "AbortError";
  this.message = message || "async_map aborted";
}
AbortError.prototype = Object.create(Error.prototype);

function AbortSignal() {
  this.aborted = false;
  this._listeners = [];
}
AbortSignal.prototype.addEventListener = function (eventName, callback) {
  if (eventName !== "abort") {
    return;
  }
  this._listeners.push(callback);
};
AbortSignal.prototype.removeEventListener = function (eventName, callback) {
  if (eventName !== "abort") {
    return;
  }
  this._listeners = this._listeners.filter(function (cb) {
    return cb !== callback;
  });
};
AbortSignal.prototype._dispatchAbort = function () {
  this._listeners.slice().forEach(function (callback) {
    callback();
  });
};

function AbortControllerSimple() {
  this.signal = new AbortSignal();
}
AbortControllerSimple.prototype.abort = function () {
  if (this.signal.aborted) {
    return;
  }
  this.signal.aborted = true;
  this.signal._dispatchAbort();
};

var AsyncUtils = {
  AbortError: AbortError,
  AbortSignal: AbortSignal,
  AbortController: AbortControllerSimple,

  _mapWorker: async function (items, mapper, delayMs, signal) {
    var result = [];
    var i;
    for (i = 0; i < items.length; i++) {
      if (signal && signal.aborted) {
        throw new AbortError("async_map aborted");
      }
      if (delayMs > 0) {
        await new Promise(function (resolve) {
          setTimeout(resolve, delayMs);
        });
      }
      if (signal && signal.aborted) {
        throw new AbortError("async_map aborted");
      }
      result.push(mapper(items[i]));
    }
    return result;
  },

  asyncMapCallback: function (items, mapper, callback, delayMs, signal) {
    delayMs = delayMs || 0;
    var onAbort = function () {};

    if (signal) {
      onAbort = function () {};
      signal.addEventListener("abort", onAbort);
      if (signal.aborted) {
        signal.removeEventListener("abort", onAbort);
        callback(new AbortError("async_map aborted"), null);
        return null;
      }
    }

    (async function () {
      try {
        var values = await AsyncUtils._mapWorker(items, mapper, delayMs, signal);
        callback(null, values);
      } catch (err) {
        callback(err, null);
      } finally {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
      }
    })();

    return true;
  },

  asyncMapPromise: function (items, mapper, delayMs, signal) {
    delayMs = delayMs || 0;
    var onAbort = function () {};

    if (signal && signal.aborted) {
      return Promise.reject(new AbortError("async_map aborted"));
    }

    var promise = AsyncUtils._mapWorker(items, mapper, delayMs, signal);

    if (signal) {
      onAbort = function () {};
      signal.addEventListener("abort", onAbort);
      promise = promise.finally(function () {
        signal.removeEventListener("abort", onAbort);
      });
    }

    return promise;
  },

  asyncMapAwait: async function (items, mapper, delayMs, signal) {
    return AsyncUtils.asyncMapPromise(items, mapper, delayMs, signal);
  },
};
