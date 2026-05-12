// Task 1: Generators and Iterators

var Generator = {
  // Infinite round-robin generator
  roundRobin: function (list) {
    var i = 0;
    return {
      next: function () {
        if (!list || list.length === 0) {
          return { done: true, value: null };
        }
        var value = list[i % list.length];
        i++;
        return { done: false, value: value };
      },
    };
  },

  // Timeout-based iterator: consume values from an iterator within a time budget
  consumeWithTimeout: function (iterator, timeoutMs, onValue) {
    var startTime = Date.now();
    var count = 0;

    while (Date.now() - startTime < timeoutMs) {
      var result = iterator.next();
      if (result.done) {
        break;
      }

      if (onValue) {
        onValue(result.value, count);
      }

      count++;
    }

    return count;
  },

  // Create a simple range generator for testing
  range: function (start, end) {
    var current = start;
    return {
      next: function () {
        if (current >= end) {
          return { done: true, value: null };
        }
        var value = current;
        current++;
        return { done: false, value: value };
      },
    };
  },
};
