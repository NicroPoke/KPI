// Task 9: Logging Decorator

var Logger = {
  createLogger: function (config) {
    config = config || {};

    var logLevel = config.logLevel || "INFO";
    var logToConsole = config.logToConsole !== false;
    var logToFile = config.logToFile || false;
    var logToJSON = config.logToJSON || false;
    var logs = [];

    var levelPriority = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

    var shouldLog = function (level) {
      return levelPriority[level] !== undefined && levelPriority[level] <= levelPriority[logLevel];
    };

    var formatEntry = function (level, message, data, duration) {
      return {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        data: data,
        duration: duration,
      };
    };

    var output = function (entry) {
      if (logToConsole) {
        console.log("[" + entry.level + "] " + entry.message + (entry.duration ? " (" + entry.duration + "ms)" : ""));
        if (entry.data) {
          console.log(entry.data);
        }
      }

      if (logToJSON) {
        logs.push(entry);
      }
    };

    return {
      log: function (level, message, data) {
        if (!shouldLog(level)) {
          return;
        }
        var entry = formatEntry(level, message, data, null);
        output(entry);
      },

      error: function (message, error) {
        this.log("ERROR", message, error);
      },

      warn: function (message, data) {
        this.log("WARN", message, data);
      },

      info: function (message, data) {
        this.log("INFO", message, data);
      },

      debug: function (message, data) {
        this.log("DEBUG", message, data);
      },

      // Decorator for functions
      decorate: function (fn, name, options) {
        options = options || {};
        var self = this;

        return function () {
          var args = Array.prototype.slice.call(arguments);
          var startTime = Date.now();

          try {
            var result = fn.apply(this, args);

            // Handle async functions
            if (result && typeof result.then === "function") {
              return result
                .then(function (asyncResult) {
                  var duration = Date.now() - startTime;
                  var entry = formatEntry("INFO", "Function " + name + " completed", { args: args, result: asyncResult }, duration);
                  output(entry);
                  return asyncResult;
                })
                .catch(function (error) {
                  var duration = Date.now() - startTime;
                  var entry = formatEntry("ERROR", "Function " + name + " failed", { args: args, error: error }, duration);
                  output(entry);
                  throw error;
                });
            }

            // Handle sync functions
            var duration = Date.now() - startTime;
            var entry = formatEntry("INFO", "Function " + name + " completed", { args: args, result: result }, duration);
            output(entry);
            return result;
          } catch (error) {
            var duration = Date.now() - startTime;
            var entry = formatEntry("ERROR", "Function " + name + " failed", { args: args, error: error }, duration);
            output(entry);
            throw error;
          }
        };
      },

      setLevel: function (level) {
        logLevel = level;
      },

      getLogs: function () {
        return logs;
      },

      clearLogs: function () {
        logs = [];
      },
    };
  },
};
