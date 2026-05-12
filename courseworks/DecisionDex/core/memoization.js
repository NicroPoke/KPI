// Task 3: Memoization System

var Memoization = {
  // Simple LRU cache
  createLRU: function (fn, maxSize) {
    var cache = {};
    var order = [];
    maxSize = maxSize || 100;

    return function () {
      var args = Array.prototype.slice.call(arguments);
      var key = JSON.stringify(args);

      if (cache.hasOwnProperty(key)) {
        // Move to end (most recently used)
        var idx = order.indexOf(key);
        if (idx > -1) {
          order.splice(idx, 1);
        }
        order.push(key);
        return cache[key];
      }

      var result = fn.apply(this, args);
      cache[key] = result;
      order.push(key);

      // Evict oldest if over size
      if (order.length > maxSize) {
        var oldestKey = order.shift();
        delete cache[oldestKey];
      }

      return result;
    };
  },

  // Simple LFU cache (least frequently used)
  createLFU: function (fn, maxSize) {
    var cache = {};
    var frequency = {};
    maxSize = maxSize || 100;

    return function () {
      var args = Array.prototype.slice.call(arguments);
      var key = JSON.stringify(args);

      if (cache.hasOwnProperty(key)) {
        frequency[key] = (frequency[key] || 0) + 1;
        return cache[key];
      }

      var result = fn.apply(this, args);
      cache[key] = result;
      frequency[key] = 1;

      if (Object.keys(cache).length > maxSize) {
        // Find least frequently used
        var leastKey = Object.keys(frequency).reduce(function (a, b) {
          return frequency[a] < frequency[b] ? a : b;
        });
        delete cache[leastKey];
        delete frequency[leastKey];
      }

      return result;
    };
  },

  // Simple TTL cache (time to live)
  createTTL: function (fn, ttlMs) {
    var cache = {};
    ttlMs = ttlMs || 60000; // default 1 minute

    return function () {
      var args = Array.prototype.slice.call(arguments);
      var key = JSON.stringify(args);
      var now = Date.now();

      if (cache.hasOwnProperty(key) && cache[key].expiry > now) {
        return cache[key].value;
      }

      var result = fn.apply(this, args);
      cache[key] = {
        value: result,
        expiry: now + ttlMs,
      };

      return result;
    };
  },
};
