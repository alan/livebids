(function() {
  var Bidder, ClientStateMachine, Collection, EE;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  EE = typeof EventEmitter !== "undefined" && EventEmitter !== null ? EventEmitter : require('events').EventEmitter;
  Collection = require('./collection').Collection;
  ClientStateMachine = require('./client_state_machine').ClientStateMachine;
  Bidder = (function() {
    __extends(Bidder, EE);
    Bidder.last_used_id = 0;
    Bidder.collection = new Collection();
    function Bidder(_arg) {
      this.user = _arg.user, this.client = _arg.client, this.sid = _arg.sid;
      this.sm = new ClientStateMachine(this);
      this.id = this.user;
      this.constructor.collection.add(this);
    }
    Bidder.prototype.new_client = function(new_client) {
      console.log("player " + this.name + " removing client " + this.client.id);
      new_client._events = this.client._events;
      this.client = new_client;
      return console.log("player " + this.id + " added client " + this.client.id);
    };
    return Bidder;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).Bidder = Bidder;
}).call(this);
