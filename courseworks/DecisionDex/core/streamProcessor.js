// Task 6: Large Data Processing via Stream/Iterator

var StreamProcessor = {
  // Create a simple data stream from an array
  createStream: function (data, chunkSize) {
    chunkSize = chunkSize || 10;
    var index = 0;

    return {
      next: function () {
        if (index >= data.length) {
          return { done: true, value: null };
        }

        var chunk = data.slice(index, index + chunkSize);
        index += chunkSize;

        return {
          done: false,
          value: chunk,
        };
      },

      // Async iterator support
      [Symbol.asyncIterator]: function () {
        return {
          next: function () {
            return Promise.resolve(this.next());
          }.bind(this),
        };
      },
    };
  },

  // Process a stream with a callback
  processStream: function (stream, processor, onComplete) {
    var processedTotal = 0;

    var processNext = function () {
      var result = stream.next();

      if (result.done) {
        if (onComplete) {
          onComplete(null, processedTotal);
        }
        return;
      }

      var chunk = result.value;
      processor(chunk, function (error) {
        if (error) {
          if (onComplete) {
            onComplete(error, processedTotal);
          }
          return;
        }

        processedTotal += chunk.length;
        setTimeout(processNext, 0); // Yield to event loop
      });
    };

    processNext();
  },

  // Async stream processor
  processStreamAsync: function (stream, processor) {
    return new Promise(function (resolve, reject) {
      var processedTotal = 0;

      var processNext = function () {
        var result = stream.next();

        if (result.done) {
          resolve(processedTotal);
          return;
        }

        var chunk = result.value;
        Promise.resolve(processor(chunk))
          .then(function () {
            processedTotal += chunk.length;
            setTimeout(processNext, 0);
          })
          .catch(reject);
      };

      processNext();
    });
  },

  // Batch multiple chunks into a single result
  batchStream: function (stream, batchSize) {
    batchSize = batchSize || 5;
    var batches = [];
    var batch = [];

    var processNext = function () {
      var result = stream.next();

      if (result.done) {
        if (batch.length > 0) {
          batches.push(batch);
        }
        return batches;
      }

      batch.push(result.value);

      if (batch.length >= batchSize) {
        batches.push(batch);
        batch = [];
      }

      return processNext();
    };

    return processNext();
  },
};
