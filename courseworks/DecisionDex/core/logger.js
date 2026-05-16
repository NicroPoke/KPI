var LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  ERROR: "ERROR",
};

function SimpleFormatter() {}
SimpleFormatter.prototype.format = function (entry) {
  return entry.timestamp + " " + entry.level + ": " + entry.message;
};

function JSONFormatter() {}
JSONFormatter.prototype.format = function (entry) {
  return JSON.stringify(entry);
};

function ConsoleSink() {}
ConsoleSink.prototype.emit = function (text) {
  console.log(text);
};

function ExternalSink() {
  this.sent = [];
}
ExternalSink.prototype.emit = function (text) {
  this.sent.push(text);
};

function LabLogger(sinks, formatter) {
  this.sinks = sinks && sinks.length ? sinks : [new ConsoleSink()];
  this.formatter = formatter || new SimpleFormatter();
  this.entries = [];
}
LabLogger.prototype.log = function (level, message, meta) {
  var entry = {
    timestamp: new Date().toISOString(),
    level: level,
    message: message,
  };
  if (meta) {
    entry.meta = meta;
  }
  this.entries.push(entry);
  var formatted = this.formatter.format(entry);
  this.sinks.forEach(function (sink) {
    try {
      sink.emit(formatted);
    } catch (_e) {
    }
  });
};
LabLogger.prototype.getLogs = function () {
  return this.entries.slice();
};

function formatArgs(args, kwargs) {
  var argsStr = (args || [])
    .map(function (a) {
      return JSON.stringify(a);
    })
    .join(", ");
  var kwargsStr = Object.keys(kwargs || {})
    .map(function (k) {
      return k + "=" + JSON.stringify(kwargs[k]);
    })
    .join(", ");
  return [argsStr, kwargsStr].filter(Boolean).join(", ");
}

function log(level, logger) {
  level = level || LogLevel.INFO;
  return function (func) {
    var actualLogger = logger || new LabLogger();
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var allArgs = formatArgs(args, {});
      var start = Date.now();

      try {
        var result = func.apply(this, args);
        if (result && typeof result.then === "function") {
          return result
            .then(function (value) {
              var elapsed = (Date.now() - start) / 1000;
              if (level !== LogLevel.ERROR) {
                actualLogger.log(level, func.name + "(" + allArgs + ") => " + JSON.stringify(value) + " [" + elapsed.toFixed(3) + "s]", {
                  func: func.name,
                  elapsed: elapsed,
                });
              }
              return value;
            })
            .catch(function (err) {
              var elapsedErr = (Date.now() - start) / 1000;
              actualLogger.log(LogLevel.ERROR, func.name + "(" + allArgs + ") raised " + (err && err.name ? err.name : "Error") + ": " + String(err && err.message ? err.message : err) + " [" + elapsedErr.toFixed(3) + "s]", {
                func: func.name,
                error: String(err && err.message ? err.message : err),
                elapsed: elapsedErr,
              });
              throw err;
            });
        }

        var elapsedSync = (Date.now() - start) / 1000;
        if (level !== LogLevel.ERROR) {
          actualLogger.log(level, func.name + "(" + allArgs + ") => " + JSON.stringify(result) + " [" + elapsedSync.toFixed(3) + "s]", {
            func: func.name,
            elapsed: elapsedSync,
          });
        }
        return result;
      } catch (errSync) {
        var elapsedFail = (Date.now() - start) / 1000;
        actualLogger.log(LogLevel.ERROR, func.name + "(" + allArgs + ") raised " + (errSync && errSync.name ? errSync.name : "Error") + ": " + String(errSync && errSync.message ? errSync.message : errSync) + " [" + elapsedFail.toFixed(3) + "s]", {
          func: func.name,
          error: String(errSync && errSync.message ? errSync.message : errSync),
          elapsed: elapsedFail,
        });
        throw errSync;
      }
    };
  };
}

var Logger = {
  LogLevel: LogLevel,
  SimpleFormatter: SimpleFormatter,
  JSONFormatter: JSONFormatter,
  ConsoleSink: ConsoleSink,
  ExternalSink: ExternalSink,
  Logger: LabLogger,
  log: log,
  createLogger: function (config) {
    config = config || {};
    var sinks = [];
    if (config.logToConsole !== false) {
      sinks.push(new ConsoleSink());
    }
    if (config.logToJSON) {
      sinks.push(new ExternalSink());
    }
    return new LabLogger(sinks, new SimpleFormatter());
  },
};
