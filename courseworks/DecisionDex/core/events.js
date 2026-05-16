function Subscription(emitter, eventName, callback) {
  this.emitter = emitter;
  this.eventName = eventName;
  this.callback = callback;
  this.active = true;
}
Subscription.prototype.unsubscribe = function () {
  if (!this.active) {
    return;
  }
  this.active = false;
  this.emitter.off(this.eventName, this.callback);
};

function EventEmitter() {
  this._listeners = {};
}
EventEmitter.prototype.on = function (eventName, callback) {
  if (!this._listeners[eventName]) {
    this._listeners[eventName] = [];
  }
  this._listeners[eventName].push(callback);
  return new Subscription(this, eventName, callback);
};
EventEmitter.prototype.off = function (eventName, callback) {
  var listeners = this._listeners[eventName];
  if (!listeners) {
    return;
  }
  this._listeners[eventName] = listeners.filter(function (listener) {
    return listener !== callback;
  });
  if (this._listeners[eventName].length === 0) {
    delete this._listeners[eventName];
  }
};
EventEmitter.prototype.emit = function (eventName, payload) {
  var callbacks = (this._listeners[eventName] || []).slice();
  var i;
  if (callbacks.length === 0 && eventName !== "error") {
    this._emitError({ event: eventName, message: "no listeners" });
    return;
  }

  for (i = 0; i < callbacks.length; i++) {
    try {
      callbacks[i](payload);
    } catch (err) {
      this._emitError({ event: eventName, error: String(err && err.message ? err.message : err) });
    }
  }
};
EventEmitter.prototype._emitError = function (errorPayload) {
  var callbacks = (this._listeners.error || []).slice();
  callbacks.forEach(function (cb) {
    try {
      cb(errorPayload);
    } catch (_e) {
    }
  });
};

function Observable(subscribeFn) {
  this._subscribeFn = subscribeFn;
}
Observable.prototype.subscribe = function (callback) {
  return this._subscribeFn(callback);
};
Observable.prototype.map = function (transform) {
  var self = this;
  return new Observable(function (callback) {
    return self.subscribe(function (value) {
      callback(transform(value));
    });
  });
};

function observe(emitter, eventName) {
  return new Observable(function (callback) {
    return emitter.on(eventName, callback);
  });
}

function MessageBus() {
  EventEmitter.call(this);
}
MessageBus.prototype = Object.create(EventEmitter.prototype);
MessageBus.prototype.constructor = MessageBus;

var Events = {
  Subscription: Subscription,
  EventEmitter: EventEmitter,
  Observable: Observable,
  MessageBus: MessageBus,
  observe: observe,
  createEmitter: function () {
    return new EventEmitter();
  },
};
