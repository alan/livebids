(function() {
  var Auction, Collection, StateMachine, auction, events, states;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  StateMachine = require('./sm').StateMachine;
  Collection = require('./collection').Collection;
  states = {
    start: {
      full_name: 'Waiting for Bidders'
    },
    active: {
      full_name: 'Auction happening now!'
    },
    complete: {
      full_name: 'Auction Finished'
    },
    payment_pending: {
      full_name: 'Waiting for Payment'
    },
    payment_collected: {
      full_name: 'Payment Completed'
    },
    finished: {
      full_name: 'End State'
    }
  };
  events = {
    bidder_joined: {
      transitions: {
        start: 'start',
        active: 'active',
        complete: 'complete',
        payment_pending: 'payment_pending',
        payment_collected: 'payment_collected'
      },
      callback: function(bidder) {
        var p;
        this.bidders.push(bidder);
        this.bidderemit(bidder, 'startup');
        this.broadcast("new bidder! " + bidder.name);
        this.broademit("bidder_joined", {
          bidders: (function() {
            var _i, _len, _ref, _results;
            _ref = this.bidders;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              p = _ref[_i];
              _results.push(p.id);
            }
            return _results;
          }).call(this)
        });
        return true;
      }
    },
    bidder_left: {
      transitions: {
        start: 'start',
        active: 'active',
        complete: 'complete',
        payment_pending: 'payment_pending',
        payment_collected: 'payment_collected'
      },
      callback: function(bidder) {
        var p;
        this.bidders = (function() {
          var _i, _len, _ref, _results;
          _ref = this.bidders;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            if (p !== bidder) {
              _results.push(p);
            }
          }
          return _results;
        }).call(this);
        this.broadcast("bidder left! " + bidder.name);
        this.broademit("bidder_left", {
          bidders: (function() {
            var _i, _len, _ref, _results;
            _ref = this.bidders;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              p = _ref[_i];
              _results.push(p.id);
            }
            return _results;
          }).call(this)
        });
        return true;
      }
    },
    start_auction: {
      transitions: {
        start: 'active'
      },
      callback: function() {
        this.broadcast("auction started ");
        return this.broademit("started");
      }
    },
    stop_auction: {
      transitions: {
        active: 'complete'
      },
      callback: function(admin) {
        this.broadcast("auction stopped");
        return this.broademit("stopped");
      }
    },
    auction_over: {
      transitions: {
        active: 'complete'
      },
      callback: function() {
        this.broadcast("auction over. Sold!");
        this.broademit("over");
        this.biddercast(this.current_bidder, "You've won and it's now time to pay");
        return this.bidderemit(this.current_bidder, "winner", {
          value: this.current_bid.value,
          auction_name: this.name
        });
      }
    },
    restart_auction: {
      transitions: {
        start: 'active',
        active: 'active',
        complete: 'active',
        payment_pending: 'active',
        payment_collected: 'active',
        active: 'active'
      },
      callback: function(admin) {
        this.broadcast("auction restarted");
        this.broademit("restarted");
        this.bids = [];
        this.current_bidder = null;
        this.current_bid = {
          value: 0,
          name: admin.name,
          image: admin.image
        };
        return this.broademit("newbid", this.current_bid);
      }
    },
    going_auction: {
      transitions: {
        active: 'active'
      },
      callback: function(admin) {
        return this.going1();
      }
    },
    bid: {
      transitions: {
        active: 'active'
      },
      callback: function(bid, bidder) {
        if (this.going != null) {
          clearTimeout(this.going);
          this.going = null;
        }
        bid.name = bidder.name;
        bid.image = bidder.image;
        console.log("auction " + this.item + " got bid " + bid.value + " from " + bidder.name);
        if (!(this.current_bid != null)) {
          console.log("first bid accepted " + bid.value + " from " + bidder.name);
          this.bids.push(bid);
          this.current_bid = bid;
          this.current_bidder = bidder;
          this.broadcast("first bid from " + bidder.name);
          this.biddercast(bidder, "bid accepted");
          this.broademit("newbid", bid);
          this.bidderemit(bidder, "bidstatus", {
            accepted: true
          });
        }
        if (bid.value > this.current_bid.value) {
          console.log("bid accepted");
          this.bids.push(bid);
          this.current_bid = bid;
          this.current_bidder = bidder;
          this.broadcast("new bid from " + bidder.name);
          this.biddercast(bidder, "bid accepted");
          this.broademit("newbid", bid);
          return this.bidderemit(bidder, "bidstatus", {
            accepted: true
          });
        } else {
          console.log("bid rejected");
          this.biddercast(bidder, "sorry, you've been out bid already");
          return this.bidderemit(bidder, "bidstatus", {
            accepted: true
          });
        }
      }
    }
  };
  Auction = (function() {
    __extends(Auction, StateMachine);
    function Auction(_arg) {
      this.item = _arg.item, this.description = _arg.description;
      Auction.__super__.constructor.call(this, 'start', states, events);
      this.bidders = [];
      this.current_bid = null;
      this.current_bidder = null;
      this.bids = [];
      this.name = "" + (Math.floor(Math.random() * 1000000000000));
      this.on('moved_state', __bind(function(state_name) {
        return this.broadcast("auction moved to " + state_name);
      }, this));
      this.getState('finished').on('enter', __bind(function() {
        var p, _i, _len, _ref;
        _ref = this.bidders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          p.sm.trigger('auction_over');
        }
        Auction.collection.remove(this.id);
        return Auction.finished_collection.remove(this.id);
      }, this));
    }
    Auction.prototype.bidderemit = function() {
      var args, b, event;
      b = arguments[0], event = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      console.log.apply(console, ["auction " + this.item + " bidderemit: " + b.name + " " + event].concat(__slice.call(args)));
      return b.emit.apply(b, [event].concat(__slice.call(args)));
    };
    Auction.prototype.biddercast = function(b, message) {
      console.log("auction " + this.item + " biddercast: " + b.name + " " + message);
      b.emit("broadcast", {
        message: message
      });
      return b.send(message);
    };
    Auction.prototype.broademit = function() {
      var args, b, event, _i, _len, _ref, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      console.log.apply(console, ["auction " + this.item + " broademit: " + event].concat(__slice.call(args)));
      _ref = this.bidders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        _results.push(b.emit.apply(b, [event].concat(__slice.call(args))));
      }
      return _results;
    };
    Auction.prototype.broadcast = function(message) {
      var b, _i, _j, _len, _len2, _ref, _ref2, _results;
      console.log("auction " + this.item + " broadcast: " + message);
      _ref = this.bidders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        b.emit("broadcast", {
          message: message
        });
      }
      _ref2 = this.bidders;
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        b = _ref2[_j];
        _results.push(b.send(message));
      }
      return _results;
    };
    Auction.prototype.going1 = function() {
      var a;
      this.broadcast('going once');
      this.broademit('going', {
        left: 3
      });
      a = this;
      return this.going = setTimeout(function() {
        a.broadcast('going twice');
        a.broademit('going', {
          left: 2
        });
        return a.going = setTimeout(function() {
          a.broadcast('going three times');
          a.broademit('going', {
            left: 1
          });
          return a.going = setTimeout(function() {
            a.trigger('auction_over');
            a.broadcast('Sold');
            return a.broademit('going', {
              left: 0
            });
          }, 2500);
        }, 2500);
      }, 2500);
    };
    return Auction;
  })();
  auction = new Auction({
    item: 'Mars Bar',
    description: 'chocolate bar'
  });
  global.live_auction = auction;
  auction.trigger('start_auction');
  (typeof exports !== "undefined" && exports !== null ? exports : window).Auction = Auction;
}).call(this);
