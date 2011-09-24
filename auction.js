(function() {
  var Auction, Collection, StateMachine, events, states;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  StateMachine = require('./sm').StateMachine;
  Collection = require('./collection').Collection;
  states = {
    start: {
      full_name: 'Waiting for Bidders'
    },
    active: {
      full_name: 'Auction happening now!'
    },
    completed: {
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
        completed: 'completed',
        payment_pending: 'payment_pending',
        payment_collected: 'payment_collected'
      },
      callback: function(bidder) {
        var p;
        bidder.client.on("" + this.namespace + ":trigger", __bind(function(data) {
          console.log("from " + bidder.user_id + " auction trigger got:", data);
          return this.trigger(data.trigger, data, bidder);
        }, this));
        this.bidders.push(bidder);
        this.bidderemit(bidder, 'startup');
        this.broadcast("new bidder! " + bidder.user_id);
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
        completed: 'completed',
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
        this.broadcast("bidder left! " + bidder.user_id);
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
        var name, pile, _ref;
        this.broadcast("auction started by " + bidder.user_id);
        this.broademit("started");
        this.deck.shuffle();
        _ref = this.piles;
        for (name in _ref) {
          pile = _ref[name];
          this.broademit('pile', {
            pile: pile
          });
        }
        return setTimeout(__bind(function() {
          return this.trigger('shuffled');
        }, this), 1000);
      }
    },
    bid: {
      transitions: {
        active: 'active'
      },
      callback: function(bid, bidder) {
        if (bid.amount > this.current_bid.amount) {
          this.bids.push(bid);
          this.current_bid = bid;
          this.broadcast("new bid from " + bidder.id);
          this.biddercast(bidder, "bid accepted");
          return this.broademit("newbid", bid);
        } else {
          return this.biddercast(bidder, "sorry, you've been out bid already");
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
      this.bids = [];
      this.name = "" + (Math.floor(Math.random() * 1000000000000));
      this.namespace = "auction:" + this.name;
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
      var args, event, p, _ref;
      p = arguments[0], event = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      console.log.apply(console, ["auction " + this.namespace + " bidderemit: " + p.user_id + " " + event].concat(__slice.call(args)));
      return (_ref = p.client).emit.apply(_ref, ["" + this.namespace + ":" + event].concat(__slice.call(args)));
    };
    Auction.prototype.biddercast = function(p, message) {
      console.log("auction " + this.namespace + " biddercast: " + p.user_id + " " + message);
      return p.client.emit("" + this.namespace + ":broadcast", {
        message: message
      });
    };
    Auction.prototype.broademit = function() {
      var args, event, p, _i, _len, _ref, _ref2, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      console.log.apply(console, ["auction " + this.namespace + " broademit: " + event].concat(__slice.call(args)));
      _ref = this.bidders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        _results.push((_ref2 = p.client).emit.apply(_ref2, ["" + this.namespace + ":" + event].concat(__slice.call(args))));
      }
      return _results;
    };
    Auction.prototype.broadcast = function(message) {
      var p, _i, _len, _ref, _results;
      console.log("auction " + this.namespace + " broadcast: " + message);
      _ref = this.bidders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        _results.push(p.client.emit("" + this.namespace + ":broadcast", {
          message: message
        }));
      }
      return _results;
    };
    return Auction;
  })();
  new Auction({
    item: 'Mars Bar',
    description: 'chocolate bar'
  });
  (typeof exports !== "undefined" && exports !== null ? exports : window).Auction = Auction;
}).call(this);
