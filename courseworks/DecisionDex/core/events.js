// Task 7: Reactive System (EventEmitter)

var Events = {
  createEmitter: function () {
    var listeners = {};

    return {
      subscribe: function (eventName, callback) {
        if (!listeners[eventName]) {
          listeners[eventName] = [];
        }
        listeners[eventName].push(callback);

        // Return unsubscribe function
        return function () {
          var idx = listeners[eventName].indexOf(callback);
          if (idx > -1) {
            listeners[eventName].splice(idx, 1);
          }
        };
      },

      unsubscribe: function (eventName, callback) {
        if (!listeners[eventName]) {
          return;
        }
        var idx = listeners[eventName].indexOf(callback);
        if (idx > -1) {
          listeners[eventName].splice(idx, 1);
        }
      },

      emit: function (eventName, data) {
        if (!listeners[eventName]) {
          return;
        }
        listeners[eventName].forEach(function (callback) {
          try {
            callback(data);
          } catch (error) {
            console.error("Error in event listener:", error);
          }
        });
      },

      once: function (eventName, callback) {
        var unsubscribe = this.subscribe(eventName, function (data) {
          callback(data);
          unsubscribe();
        });
        return unsubscribe;
      },

      listeners: function (eventName) {
        return listeners[eventName] ? listeners[eventName].length : 0;
      },

      clear: function (eventName) {
        if (eventName) {
          delete listeners[eventName];
        } else {
          listeners = {};
        }
      },
    };
  },
};
