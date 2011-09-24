(function() {
  var Auction, ClientStateMachine, StateMachine, events, states;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  StateMachine = require('./sm').StateMachine;
  Auction = require('./auction').Auction;
  states = {
    start: {
      full_name: 'Welcome',
      on_enter: function(event) {
        return console.log("entering CSM start due to " + event.name);
      },
      on_exit: function(event) {
        return console.log("exiting CSM start due to " + event.name);
      }
    },
    in_auction: {
      full_name: 'In a Auction'
    },
    logged_out: {
      full_name: 'Logged Out'
    }
  };
  events = {
    join_auction: {
      transitions: {
        start: 'in_auction'
      },
      callback: function() {
        this.auction.trigger('bidder_joined', this.bidder);
        return true;
      }
    },
    logout: {
      transitions: {
        start: 'logged_out',
        in_auction: 'logged_out'
      }
    }
  };
  ClientStateMachine = (function() {
    __extends(ClientStateMachine, StateMachine);
    function ClientStateMachine(bidder) {
      this.bidder = bidder;
      ClientStateMachine.__super__.constructor.call(this, 'start', states, events);
      this.bidder.emit('mess', {
        message: "Welcome! current state is " + this.current_state.name + "."
      });
      this.bidder.emit('auction_list', {
        auction_list: Auction.start_collection.list()
      });
      Auction.start_collection.on('change', __bind(function() {
        return this.bidder.emit('auction_list', {
          auction_list: Auction.start_collection.list()
        });
      }, this));
      this.on('moved_state', __bind(function(state_name) {
        if (state_name == null) {
          state_name = 'unknown!';
        }
        return this.bidder.emit('mess', {
          message: "moved state to " + state_name
        });
      }, this));
    }
    return ClientStateMachine;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).ClientStateMachine = ClientStateMachine;
}).call(this);
