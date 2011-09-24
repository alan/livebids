(function() {
  var Bidder, ClientStateMachine, Collection, EE;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  EE = typeof EventEmitter !== "undefined" && EventEmitter !== null ? EventEmitter : require('events').EventEmitter;
  Collection = require('./collection').Collection;
  ClientStateMachine = require('./client_state_machine').ClientStateMachine;
  Bidder = (function() {
    __extends(Bidder, EE);
    Bidder.last_used_id = 0;
    Bidder.collection = new Collection();
    function Bidder(_arg) {
      var client;
      this.user = _arg.user, client = _arg.client, this.sid = _arg.sid;
      this.sm = new ClientStateMachine(this);
      this.id = this.user;
      this.constructor.collection.add(this);
      this.new_client(client);
    }
    Bidder.prototype.new_client = function(new_client) {
      new_client.on('trigger', __bind(function(data) {
        console.log("got " + this.user + ":" + new_client.id + " trigger: ", data);
        return this.sm.trigger(data.trigger, data);
      }, this));
      return new_client.on('bid', __bind(function(data) {
        console.log("got bid " + this.user + ":" + new_client.id + " bid: ", data);
        return this.sm.trigger('bid', data);
      }, this));
    };
    Bidder.prototype.emit = function(name, args) {
      return global.io.sockets["in"](this.sid).emit(name, args);
    };
    return Bidder;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).Bidder = Bidder;
}).call(this);
