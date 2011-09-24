(function() {
  var Collection, EE, Event, State, StateMachine;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  EE = typeof EventEmitter !== "undefined" && EventEmitter !== null ? EventEmitter : require('events').EventEmitter;
  Collection = require('./collection').Collection;
  State = (function() {
    __extends(State, EE);
    function State(name, attrs) {
      this.name = name;
      this.attrs = attrs;
      this.events_by_name = {};
      this.events_by_trigger = {};
      this.exclusive_triggers = [];
      if (this.attrs.on_enter) {
        this.on('enter', this.attrs.on_enter);
      }
      if (this.attrs.on_exit) {
        this.on('exit', this.attrs.on_exit);
      }
    }
    State.prototype.event_names = function() {
      var event, name, _ref, _results;
      _ref = this.events_by_name;
      _results = [];
      for (name in _ref) {
        event = _ref[name];
        _results.push(name);
      }
      return _results;
    };
    return State;
  })();
  Event = (function() {
    __extends(Event, EE);
    function Event(name, attrs) {
      this.name = name;
      this.transitions = attrs.transitions;
      this.callback = attrs.callback;
      this.triggers = attrs.triggers;
      this.exclusive_triggers = attrs.exclusive_triggers;
    }
    Event.prototype.transition_from = function(from_state) {
      return this.transitions[from_state];
    };
    Event.prototype.triggers = function() {
      return this.triggers;
    };
    Event.prototype.exclusive_triggers = function() {
      return this.exclusive_triggers;
    };
    Event.prototype.callback = function() {
      return this.callback;
    };
    return Event;
  })();
  StateMachine = (function() {
    __extends(StateMachine, EE);
    StateMachine.last_used_id = 0;
    function StateMachine(initial_state_name, states, events) {
      var attrs, initialise, name, _base;
      this.initial_state_name = initial_state_name != null ? initial_state_name : "start";
      if (states == null) {
        states = {};
      }
      if (events == null) {
        events = {};
      }
      this.id = (this.constructor.last_used_id += 1);
      this.states = {};
      this.events = {};
      for (name in states) {
        attrs = states[name];
        this.addState(name, attrs);
      }
      for (name in events) {
        attrs = events[name];
        this.addEvent(name, attrs);
      }
      this.states[this.initial_state_name] || this.addState(this.initial_state_name);
      initialise = this.addEvent('initialise');
      console.log('constructor name is ', this.constructor.name);
      (_base = this.constructor).collection || (_base.collection = new Collection());
      this.constructor.collection.add(this);
      this.move_state(this.initial_state_name, initialise);
    }
    StateMachine.prototype.addState = function(name, attrs) {
      var _base, _name, _ref;
      if (attrs == null) {
        attrs = {};
      }
      if (this.states[name] != null) {
        return this.states[name].attrs = attrs;
      } else {
        if ((_ref = (_base = this.constructor)[_name = "" + name + "_collection"]) == null) {
          _base[_name] = new Collection();
        }
        return this.states[name] = new State(name, attrs);
      }
    };
    StateMachine.prototype.getState = function(name) {
      return this.states[name];
    };
    StateMachine.prototype.addEvent = function(name, attrs) {
      var event, from, to, trigger, _i, _len, _ref, _ref2, _results;
      if (attrs == null) {
        attrs = {};
      }
      event = new Event(name, attrs);
      this.events[name] = event;
      _ref = attrs.transitions;
      _results = [];
      for (from in _ref) {
        to = _ref[from];
        this.states[from].events_by_name[name] = event;
        if (event.triggers != null) {
          _ref2 = event.triggers;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            trigger = _ref2[_i];
            this.states[from].events_by_trigger[trigger] = event;
          }
        }
        _results.push((function() {
          var _j, _len2, _ref3, _results2;
          if (event.exclusive_triggers != null) {
            _ref3 = event.exclusive_triggers;
            _results2 = [];
            for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
              trigger = _ref3[_j];
              _results2.push(this.states[from].exclusive_triggers.push(trigger));
            }
            return _results2;
          }
        }).call(this));
      }
      return _results;
    };
    StateMachine.prototype.getEvent = function(name) {
      return this.events[name];
    };
    StateMachine.prototype.trigger = function() {
      var args, event, event_name, result, _ref;
      event_name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      event = this.current_state.events_by_name[event_name];
      if (event == null) {
        console.log("" + event_name + " is not valid for state " + this.current_state.name);
        return false;
      }
      event.emit('triggered', this.current_state);
      if (event.callback) {
        result = (_ref = event.callback).call.apply(_ref, [this].concat(__slice.call(args)));
        if (typeof result === "string") {
          return this.move_state(result, event);
        } else if (result) {
          return this.move_state(event.transition_from(this.current_state.name), event);
        } else {
          return false;
        }
      } else {
        return this.move_state(event.transition_from(this.current_state.name), event);
      }
    };
    StateMachine.prototype.move_state = function(state_name, event) {
      if (!(this.current_state != null) || this.current_state.name !== state_name) {
        if (this.current_state != null) {
          this.current_state.emit('exit', event);
          this.constructor["" + this.current_state.name + "_collection"].remove(this.id);
        }
        this.current_state = this.states[state_name] || console.log("state_name " + state_name + " not found!");
        this.emit('moved_state', state_name);
        this.current_state.emit('enter', event);
        this.constructor["" + this.current_state.name + "_collection"].add(this);
      }
      return true;
    };
    return StateMachine;
  })();
  (typeof exports !== "undefined" && exports !== null ? exports : window).StateMachine = StateMachine;
}).call(this);
