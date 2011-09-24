(function() {
  var Collection, EE;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  EE = typeof EventEmitter !== "undefined" && EventEmitter !== null ? EventEmitter : require('events').EventEmitter;
  Collection = (function() {
    __extends(Collection, EE);
    function Collection() {
      this.hash = {};
    }
    Collection.prototype.add = function(item) {
      this.hash[item.id || item.name] = item;
      this.emit('add', item);
      return this.emit('change', item);
    };
    Collection.prototype.get = function(name) {
      return this.hash[name];
    };
    Collection.prototype.list = function() {
      var item, name, _ref, _results;
      _ref = this.hash;
      _results = [];
      for (name in _ref) {
        item = _ref[name];
        _results.push(name);
      }
      return _results;
    };
    Collection.prototype.all = function() {
      var item, name, _ref, _results;
      _ref = this.hash;
      _results = [];
      for (name in _ref) {
        item = _ref[name];
        _results.push(item);
      }
      return _results;
    };
    Collection.prototype.remove = function(name) {
      var item;
      item = this.hash[name];
      delete this.hash[name];
      this.emit('remove', item);
      return this.emit('change', item);
    };
    Collection.prototype.hash = function() {
      return this.hash;
    };
    return Collection;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).Collection = Collection;
}).call(this);
