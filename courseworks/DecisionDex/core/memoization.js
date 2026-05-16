var Memoization = {
  memoize: function (fn, options) {
    options = options || {};
    var maxSize = options.maxSize == null ? null : options.maxSize;
    var policy = (options.policy || options.strategy || "lru").toLowerCase();
    var ttlSeconds = options.ttlSeconds == null ? options.ttl : options.ttlSeconds;
    var customEvictor = options.customEvictor || null;

    if (maxSize !== null && maxSize < 1) {
      throw new Error("maxSize must be null or a positive integer");
    }
    if (["lru", "lfu", "ttl", "custom"].indexOf(policy) === -1) {
      throw new Error("policy must be one of: lru, lfu, ttl, custom");
    }
    if (ttlSeconds != null && ttlSeconds <= 0) {
      throw new Error("ttlSeconds must be positive");
    }
    if (policy === "ttl" && ttlSeconds == null) {
      throw new Error("ttlSeconds is required when policy='ttl'");
    }
    if (policy === "custom" && !customEvictor) {
      throw new Error("customEvictor is required when policy='custom'");
    }

    var cache = new Map();

    function makeKey(args, kwargs) {
      return JSON.stringify([args, kwargs]);
    }

    function parseKey(key) {
      try {
        var parsed = JSON.parse(key);
        return { args: parsed[0] || [], kwargs: parsed[1] || {} };
      } catch (e) {
        return { args: [], kwargs: {} };
      }
    }

    function isExpired(entry, now) {
      if (policy !== "ttl" || ttlSeconds == null) {
        return false;
      }
      return now - entry.createdAt >= ttlSeconds * 1000;
    }

    function pruneExpired(now) {
      if (policy !== "ttl" || ttlSeconds == null) {
        return;
      }
      var toDelete = [];
      cache.forEach(function (entry, key) {
        if (isExpired(entry, now)) {
          toDelete.push(key);
        }
      });
      toDelete.forEach(function (key) {
        cache.delete(key);
      });
    }

    function evictOne() {
      if (cache.size === 0) {
        return;
      }

      var keyToRemove = null;

      if (policy === "lru") {
        cache.forEach(function (entry, key) {
          if (!keyToRemove || entry.lastAccess < cache.get(keyToRemove).lastAccess) {
            keyToRemove = key;
          }
        });
      } else if (policy === "lfu") {
        cache.forEach(function (entry, key) {
          if (!keyToRemove) {
            keyToRemove = key;
            return;
          }
          var current = cache.get(keyToRemove);
          if (
            entry.accessCount < current.accessCount ||
            (entry.accessCount === current.accessCount && entry.lastAccess < current.lastAccess)
          ) {
            keyToRemove = key;
          }
        });
      } else if (policy === "ttl") {
        cache.forEach(function (entry, key) {
          if (!keyToRemove || entry.createdAt < cache.get(keyToRemove).createdAt) {
            keyToRemove = key;
          }
        });
      } else {
        var snapshot = {};
        cache.forEach(function (entry, key) {
          snapshot[key] = {
            value: entry.value,
            createdAt: entry.createdAt,
            lastAccess: entry.lastAccess,
            accessCount: entry.accessCount,
            keyData: parseKey(key),
          };
        });
        var customKey = customEvictor ? customEvictor(snapshot) : null;
        if (customKey && cache.has(customKey)) {
          keyToRemove = customKey;
        }
      }

      if (!keyToRemove) {
        cache.forEach(function (_entry, key) {
          if (!keyToRemove) {
            keyToRemove = key;
          }
        });
      }

      if (keyToRemove) {
        cache.delete(keyToRemove);
      }
    }

    return function () {
      var args = Array.prototype.slice.call(arguments);
      var kwargs = {};
      var now = Date.now();

      pruneExpired(now);

      var key = makeKey(args, kwargs);
      if (cache.has(key)) {
        var entry = cache.get(key);
        if (!isExpired(entry, now)) {
          entry.lastAccess = now;
          entry.accessCount += 1;
          return entry.value;
        }
        cache.delete(key);
      }

      var result = fn.apply(this, args);

      while (maxSize !== null && cache.size >= maxSize) {
        evictOne();
      }

      cache.set(key, {
        value: result,
        createdAt: now,
        lastAccess: now,
        accessCount: 1,
      });
      return result;
    };
  },
};
