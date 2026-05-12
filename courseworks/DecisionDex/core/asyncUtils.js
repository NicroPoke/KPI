// Task 5: Async Array Function (map)

var AsyncUtils = {
  // Async map with callback
  asyncMapCallback: function (arr, fn, callback) {
    var results = [];
    var completed = 0;
    var total = arr.length;

    if (total === 0) {
      callback(null, results);
      return;
    }

    arr.forEach(function (item, index) {
      var promise = Promise.resolve(fn(item, index));
      promise
        .then(function (result) {
          results[index] = result;
          completed++;
          if (completed === total) {
            callback(null, results);
          }
        })
        .catch(function (error) {
          callback(error, null);
        });
    });
  },

  // Async map returning a Promise
  asyncMapPromise: function (arr, fn) {
    return Promise.all(
      arr.map(function (item, index) {
        return Promise.resolve(fn(item, index));
      })
    );
  },

  // Async map with AbortController support
  asyncMapAbortable: function (arr, fn, abortSignal) {
    return new Promise(function (resolve, reject) {
      var results = [];
      var completed = 0;
      var total = arr.length;

      if (total === 0) {
        resolve(results);
        return;
      }

      var onAbort = function () {
        reject(new Error("Operation aborted"));
      };

      if (abortSignal) {
        if (abortSignal.aborted) {
          reject(new Error("Operation aborted"));
          return;
        }
        abortSignal.addEventListener("abort", onAbort);
      }

      arr.forEach(function (item, index) {
        var promise = Promise.resolve(fn(item, index));
        promise
          .then(function (result) {
            if (!abortSignal || !abortSignal.aborted) {
              results[index] = result;
              completed++;
              if (completed === total) {
                if (abortSignal) {
                  abortSignal.removeEventListener("abort", onAbort);
                }
                resolve(results);
              }
            }
          })
          .catch(function (error) {
            if (abortSignal) {
              abortSignal.removeEventListener("abort", onAbort);
            }
            reject(error);
          });
      });
    });
  },

  // Simple async delay utility
  delay: function (ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  },
};
