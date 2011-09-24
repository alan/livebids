
EE = if EventEmitter? then EventEmitter else require('events').EventEmitter
Collection = require('./collection').Collection

class State extends EE
  constructor: (@name, @attrs) ->
    @events_by_name = {}
    @events_by_trigger = {}
    @exclusive_triggers = []
    @on 'enter', @attrs.on_enter if @attrs.on_enter
    @on 'exit', @attrs.on_exit if @attrs.on_exit

  event_names: -> name for name, event of @events_by_name

class Event extends EE
  constructor: (@name, attrs) ->
    @transitions =  attrs.transitions
    @callback =  attrs.callback
    @triggers =  attrs.triggers
    @exclusive_triggers =  attrs.exclusive_triggers
  transition_from: (from_state) -> @transitions[from_state]
  triggers: -> @triggers
  exclusive_triggers: -> @exclusive_triggers
  callback: -> @callback

class StateMachine extends EE
  @last_used_id = 0
  constructor: (@initial_state_name = "start", states = {} , events = {}) ->
    @id = ( @constructor.last_used_id += 1 )
    @states = {}
    @events = {}
    @addState name, attrs for name, attrs of states
    @addEvent name, attrs for name, attrs of events
    @states[@initial_state_name] or @addState @initial_state_name
    initialise = @addEvent 'initialise'
    console.log('constructor name is ', @constructor.name)
    @constructor.collection ||= new Collection()
    (@constructor).collection.add @
    @move_state @initial_state_name, initialise
    
   addState: (name, attrs = {}) ->
     if @states[name]?
       @states[name].attrs = attrs
     else
       @constructor["#{name}_collection"] ?= new Collection()
       @states[name] = new State name, attrs

   getState: (name) -> @states[name]

   addEvent: (name, attrs = {}) ->
     event =  new Event name, attrs
     @events[name] = event

     for from, to of attrs.transitions
       @states[from].events_by_name[name] = event
       if event.triggers?
         @states[from].events_by_trigger[trigger] = event for trigger in event.triggers
       if event.exclusive_triggers?
         @states[from].exclusive_triggers.push(trigger) for trigger in event.exclusive_triggers

  getEvent: (name) -> @events[name]

  trigger: (event_name, args...) ->
    event = @current_state.events_by_name[event_name]
    unless event?
      console.log("#{event_name} is not valid for state #{@current_state.name}")
      return false
    event.emit 'triggered', @current_state
    if event.callback
      result = event.callback.call(this, args...)
      if typeof result == "string"
        # todo: check that result is an allowed state to transition to
        @move_state result, event
      else if result
        @move_state event.transition_from(@current_state.name), event
      else # callback returned false
        return false
    else
      @move_state event.transition_from(@current_state.name), event

  move_state: (state_name, event) ->
    if !@current_state? or @current_state.name != state_name
      if @current_state?
        @current_state.emit 'exit', event
        @constructor["#{@current_state.name}_collection"].remove @id
      @current_state = @states[state_name] or console.log("state_name #{state_name} not found!")
      @emit 'moved_state', state_name
      @current_state.emit 'enter', event
      @constructor["#{@current_state.name}_collection"].add @
    true


(exports ? window).StateMachine = StateMachine



# callbacks...
#process_key = (key, jq_event) =>
#  if $selected and not $selected.is(':visible')
#    move_state 'start'
#  return if ! current_state.events_by_trigger?[key]?
#  return if jq_event.target and !_und.include(current_state.exclusive_triggers,key) and ((/textarea|select/i.test( jq_event.target.nodeName )) or (/text|password|search|tel|url|email|number/i.test( jq_event.target.type ) ))
#  # otherwise, let's deal with it...
#  jq_event.preventDefault()
#  triggerEvent(current_state.events_by_trigger[key].name, key)


