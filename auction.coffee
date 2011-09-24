
StateMachine = require('./sm').StateMachine
Collection = require('./collection').Collection

states =
  start:
    full_name: 'Waiting for Bidders'
  active:
    full_name: 'Auction happening now!'
  completed:
    full_name: 'Auction Finished'
  payment_pending:
    full_name: 'Waiting for Payment'
  payment_collected:
    full_name: 'Payment Completed'
  finished:
    full_name: 'End State'


events =
  bidder_joined:
    transitions:
      start: 'start'
      active: 'active'
      completed: 'completed'
      payment_pending: 'payment_pending'
      payment_collected: 'payment_collected'
    callback: (bidder) ->
      bidder.client.on "#{@namespace}:trigger", (data) =>
        console.log "from #{bidder.user_id} auction trigger got:", data
        @trigger data.trigger, data, bidder

      # todo , regisiter a 'disconnect' handler?
      @bidders.push bidder
      @bidderemit bidder, 'startup'
      @broadcast "new bidder! #{bidder.user_id}"
      @broademit "bidder_joined", bidders: (p.id for p in @bidders)
      true
  bidder_left:
    transitions:
      start: 'start'
      active: 'active'
      completed: 'completed'
      payment_pending: 'payment_pending'
      payment_collected: 'payment_collected'
    callback: (bidder) ->
      @bidders = (p for p in @bidders when p != bidder)
      @broadcast "bidder left! #{bidder.user_id}"
      @broademit "bidder_left", bidders: (p.id for p in @bidders)
      true
  start_auction:
    transitions:
      start: 'active'
    callback: () ->
      @broadcast "auction started by #{bidder.user_id}"
      @broademit "started"
      @deck.shuffle()
      for name, pile of @piles
        @broademit 'pile', pile: pile
      setTimeout =>
        @trigger('shuffled')
      , 1000
  bid:
    transitions:
      active: 'active'
    callback: (bid, bidder) ->
      # auction logic
      if bid.amount > @current_bid.amount

        @bids.push bid
        @current_bid = bid
      
        @broadcast "new bid from #{bidder.id}"
        @biddercast bidder, "bid accepted"
        @broademit "newbid", bid
      else
        @biddercast bidder, "sorry, you've been out bid already"


class Auction extends StateMachine
  constructor: (item: @item, description: @description ) ->
    super('start', states, events)
    @bidders = []
    @current_bid = null
    @bids = []
    @name = "#{Math.floor(Math.random() * 1000000000000)}" #TODO make unique
    @namespace = "auction:#{@name}"

    @on 'moved_state', (state_name) =>
      @broadcast "auction moved to #{state_name}"

    @getState('finished').on 'enter', =>
      p.sm.trigger 'auction_over' for p in @bidders
      # todo: move this cleanup to sm special 'finished' state or event
      Auction.collection.remove @id
      Auction.finished_collection.remove @id

   bidderemit: (p, event, args...) ->
     console.log "auction #{@namespace} bidderemit: #{p.user_id} #{event}", args...
     p.client.emit("#{@namespace}:#{event}", args...)

   biddercast: (p, message) ->
     console.log "auction #{@namespace} biddercast: #{p.user_id} #{message}"
     p.client.emit("#{@namespace}:broadcast", message: message)

   broademit: (event, args...) ->
     console.log "auction #{@namespace} broademit: #{event}", args...
     p.client.emit("#{@namespace}:#{event}", args...) for p in @bidders

   broadcast: (message) ->
     console.log "auction #{@namespace} broadcast: #{message}"
     p.client.emit("#{@namespace}:broadcast", message: message) for p in @bidders

# create an auction
new Auction({ item: 'Mars Bar', description: 'chocolate bar'})

(exports ? window).Auction = Auction

