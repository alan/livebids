
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
      # todo , regisiter a 'disconnect' handler?
      @bidders.push bidder
      @bidderemit bidder, 'startup'
      @broadcast "new bidder! #{bidder.user}"
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
      @broadcast "bidder left! #{bidder.user}"
      @broademit "bidder_left", bidders: (p.id for p in @bidders)
      true
  start_auction:
    transitions:
      start: 'active'
    callback: () ->
      @broadcast "auction started "
      @broademit "started"
  bid:
    transitions:
      active: 'active'
    callback: (bid, bidder) ->
      bid.user = bidder.user
      # auction logic
      console.log "auction #{@item} got bid #{bid.value} from #{bidder.user}"
      if !@current_bid?
        console.log "first bid accepted #{bid.value} from #{bidder.user}"

        @bids.push bid
        @current_bid = bid
        @broadcast "first bid from #{bidder.id}"
        @biddercast bidder, "bid accepted"
        @broademit "newbid", bid

      if bid.value > @current_bid.value
        console.log "bid accepted"

        @bids.push bid
        @current_bid = bid
        @broadcast "new bid from #{bidder.id}"
        @biddercast bidder, "bid accepted"
        @broademit "newbid", bid
      else
        console.log "bid rejected"
        @biddercast bidder, "sorry, you've been out bid already"


class Auction extends StateMachine
  constructor: (item: @item, description: @description ) ->
    super('start', states, events)
    @bidders = []
    @current_bid = null
    @bids = []
    @name = "#{Math.floor(Math.random() * 1000000000000)}" #TODO make unique

    @on 'moved_state', (state_name) =>
      @broadcast "auction moved to #{state_name}"

    @getState('finished').on 'enter', =>
      p.sm.trigger 'auction_over' for p in @bidders
      # todo: move this cleanup to sm special 'finished' state or event
      Auction.collection.remove @id
      Auction.finished_collection.remove @id

   bidderemit: (b, event, args...) ->
     console.log "auction #{@item} bidderemit: #{b.user} #{event}", args...
     b.emit(event, args...)

   biddercast: (b, message) ->
     console.log "auction #{@item} biddercast: #{b.user} #{message}"
     b.emit("broadcast", message: message)

   broademit: (event, args...) ->
     console.log "auction #{@item} broademit: #{event}", args...
     b.emit(event, args...) for b in @bidders

   broadcast: (message) ->
     console.log "auction #{@item} broadcast: #{message}"
     b.emit("broadcast", message: message) for b in @bidders

# create an auction
auction = new Auction({ item: 'Mars Bar', description: 'chocolate bar'})
# until we have admin, make it the global live auction
global.live_auction = auction
# until we have admin, start the auction
auction.trigger('start_auction')

(exports ? window).Auction = Auction

