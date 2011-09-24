
StateMachine = require('./sm').StateMachine
Auction = require('./auction').Auction

states =
  start:
    full_name: 'Welcome'
    on_enter: (event) ->
      console.log "entering CSM start due to #{event.name}"
    on_exit: (event) ->
      console.log "exiting CSM start due to #{event.name}"
  in_auction:
    full_name: 'In a Auction'
  logged_out:
    full_name: 'Logged Out'


events =
  join_auction:
    transitions:
      start: 'in_auction'
    callback: ->
      @auction.trigger 'bidder_joined', @bidder
      true
  logout:
    transitions:
      start: 'logged_out'
      in_auction: 'logged_out'


class ClientStateMachine extends StateMachine
  constructor: (@bidder) ->
    super 'start', states, events
    @bidder.emit 'mess', message: "Welcome! current state is #{@current_state.name}."
    # todo move this next line to start state enter.
    @bidder.emit 'auction_list', auction_list: Auction.start_collection.list()
    Auction.start_collection.on 'change', =>
      @bidder.emit 'auction_list', auction_list: Auction.start_collection.list()

    @on 'moved_state', (state_name = 'unknown!') => @bidder.emit 'mess', message: "moved state to #{state_name}"


(exports ? window).ClientStateMachine = ClientStateMachine

