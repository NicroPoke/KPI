function BiDirectionalPriorityQueue() {
  this._rows = [];
  this._orderCounter = 0;
}

BiDirectionalPriorityQueue.prototype.enqueue = function (item, priority) {
  this._rows.push({
    item: item,
    priority: priority,
    order: this._orderCounter,
  });
  this._orderCounter += 1;
};

BiDirectionalPriorityQueue.prototype.isEmpty = function () {
  return this._rows.length === 0;
};

BiDirectionalPriorityQueue.prototype.length = function () {
  return this._rows.length;
};

BiDirectionalPriorityQueue.prototype._resolveMode = function (opts) {
  opts = opts || {};
  var selected = [];
  if (opts.highest) {
    selected.push("highest");
  }
  if (opts.lowest) {
    selected.push("lowest");
  }
  if (opts.oldest) {
    selected.push("oldest");
  }
  if (opts.newest) {
    selected.push("newest");
  }

  if (selected.length > 1) {
    throw new Error("Choose exactly one mode: highest/lowest/oldest/newest");
  }
  return selected.length === 1 ? selected[0] : "highest";
};

BiDirectionalPriorityQueue.prototype._findIndex = function (mode) {
  if (this.isEmpty()) {
    throw new Error("Queue is empty");
  }

  var i;
  var bestIndex = 0;

  if (mode === "highest") {
    for (i = 1; i < this._rows.length; i++) {
      var a = this._rows[i];
      var b = this._rows[bestIndex];
      if (a.priority > b.priority || (a.priority === b.priority && a.order < b.order)) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  if (mode === "lowest") {
    for (i = 1; i < this._rows.length; i++) {
      var c = this._rows[i];
      var d = this._rows[bestIndex];
      if (c.priority < d.priority || (c.priority === d.priority && c.order < d.order)) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  if (mode === "oldest") {
    for (i = 1; i < this._rows.length; i++) {
      if (this._rows[i].order < this._rows[bestIndex].order) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  for (i = 1; i < this._rows.length; i++) {
    if (this._rows[i].order > this._rows[bestIndex].order) {
      bestIndex = i;
    }
  }
  return bestIndex;
};

BiDirectionalPriorityQueue.prototype.peek = function (opts) {
  var mode = this._resolveMode(opts);
  var idx = this._findIndex(mode);
  return this._rows[idx].item;
};

BiDirectionalPriorityQueue.prototype.dequeue = function (opts) {
  var mode = this._resolveMode(opts);
  var idx = this._findIndex(mode);
  var row = this._rows.splice(idx, 1)[0];
  return row.item;
};

var PriorityQueue = {
  BiDirectionalPriorityQueue: BiDirectionalPriorityQueue,
  create: function () {
    return new BiDirectionalPriorityQueue();
  },
};
