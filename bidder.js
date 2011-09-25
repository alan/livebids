(function() {
  var Auction, Bidder, Collection, EE;
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
  Auction = require('./auction').Auction;
  Bidder = (function() {
    __extends(Bidder, EE);
    Bidder.last_used_id = 0;
    Bidder.collection = new Collection();
    function Bidder(_arg) {
      var client;
      this.name = _arg.name, client = _arg.client, this.sid = _arg.sid, this.image = _arg.image;
      this.constructor.collection.add(this);
      this.new_client(client);
      this.state = "logged_out";
      global.live_auction.trigger('bidder_joined', this);
    }
    Bidder.prototype.new_client = function(new_client) {
      new_client.on('trigger', __bind(function(data) {
        return console.log("got " + this.name + ":" + new_client.id + " trigger: ", data);
      }, this));
      return new_client.on('bid', __bind(function(data) {
        console.log("got bid " + this.name + ":" + new_client.id + " bid: ", data);
        if (global.live_auction != null) {
          return global.live_auction.trigger('bid', data, this);
        } else {
          return console.log("no global live_auction to tribber bid to");
        }
      }, this));
    };
    Bidder.prototype.login = function() {
      return this.state = "logged_in";
    };
    Bidder.prototype.logout = function() {
      return this.state = "logged_out";
    };
    Bidder.prototype.emit = function(name, args) {
      return global.io.sockets["in"](this.sid).emit(name, args);
    };
    return Bidder;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).Bidder = Bidder;
}).call(this);
