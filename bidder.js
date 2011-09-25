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
      new_client.on('bid', __bind(function(data) {
        console.log("got bid " + this.name + ":" + new_client.id + " bid: ", data);
        if (global.live_auction != null) {
          return global.live_auction.trigger('bid', data, this);
        } else {
          return console.log("no global live_auction to trigger bid to");
        }
      }, this));
      new_client.on('activityview', __bind(function() {
        new_client.leave('/' + this.sid);
        return new_client.join('activity');
      }, this));
      if (this.name === 'bids live') {
        console.log("admin actions for new connected client");
        this.emit('adminbuttons');
        new_client.on('stop_auction', __bind(function() {
          if (global.live_auction != null) {
            return global.live_auction.trigger('stop_auction', this);
          } else {
            return console.log("no global live_auction to trigger stop to");
          }
        }, this));
        new_client.on('going_auction', __bind(function() {
          if (global.live_auction != null) {
            return global.live_auction.trigger('going_auction', this);
          } else {
            return console.log("no global live_auction to trigger stop to");
          }
        }, this));
        new_client.on('restart_auction', __bind(function() {
          if (global.live_auction != null) {
            return global.live_auction.trigger('restart_auction', this);
          } else {
            return console.log("no global live_auction to trigger stop to");
          }
        }, this));
      }
      this.emit('state', {
        state: this.state
      });
      if ((global.live_auction != null) && (global.live_auction.current_bid != null)) {
        return this.emit('newbid', global.live_auction.current_bid);
      }
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
    Bidder.prototype.send = function(message) {
      return global.io.sockets["in"](this.sid).send(message);
    };
    return Bidder;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).Bidder = Bidder;
}).call(this);
