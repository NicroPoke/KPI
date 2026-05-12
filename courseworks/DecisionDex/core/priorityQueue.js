// Task 4: Bi-Directional Priority Queue

var PriorityQueue = {
  create: function () {
    var items = [];

    return {
      enqueue: function (item, priority) {
        items.push({ item: item, priority: priority, timestamp: Date.now() });
        // Sort by priority (lower number = higher priority)
        items.sort(function (a, b) {
          return a.priority - b.priority;
        });
      },

      dequeue: function (mode) {
        if (items.length === 0) {
          return null;
        }

        mode = mode || "highest";

        var removed;
        if (mode === "highest") {
          removed = items.shift();
        } else if (mode === "lowest") {
          removed = items.pop();
        } else if (mode === "oldest") {
          // Find oldest by timestamp
          var oldestIdx = 0;
          for (var i = 1; i < items.length; i++) {
            if (items[i].timestamp < items[oldestIdx].timestamp) {
              oldestIdx = i;
            }
          }
          removed = items.splice(oldestIdx, 1)[0];
        } else if (mode === "newest") {
          // Find newest by timestamp
          var newestIdx = 0;
          for (var i = 1; i < items.length; i++) {
            if (items[i].timestamp > items[newestIdx].timestamp) {
              newestIdx = i;
            }
          }
          removed = items.splice(newestIdx, 1)[0];
        }

        return removed ? removed.item : null;
      },

      peek: function (mode) {
        if (items.length === 0) {
          return null;
        }

        mode = mode || "highest";

        if (mode === "highest") {
          return items[0].item;
        } else if (mode === "lowest") {
          return items[items.length - 1].item;
        } else if (mode === "oldest") {
          var oldestIdx = 0;
          for (var i = 1; i < items.length; i++) {
            if (items[i].timestamp < items[oldestIdx].timestamp) {
              oldestIdx = i;
            }
          }
          return items[oldestIdx].item;
        } else if (mode === "newest") {
          var newestIdx = 0;
          for (var i = 1; i < items.length; i++) {
            if (items[i].timestamp > items[newestIdx].timestamp) {
              newestIdx = i;
            }
          }
          return items[newestIdx].item;
        }

        return null;
      },

      size: function () {
        return items.length;
      },

      clear: function () {
        items = [];
      },
    };
  },
};
