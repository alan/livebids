
StateMachine = require('./sm').StateMachine
Collection = require('./collection').Collection

states =
  start:
    full_name: 'Waiting for Bidders'
  active:
    full_name: 'Auction happening now!'
  complete:
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
      complete: 'complete'
      payment_pending: 'payment_pending'
      payment_collected: 'payment_collected'
    callback: (bidder) ->
      # todo , regisiter a 'disconnect' handler?
      @bidders.push bidder
      @bidderemit bidder, 'startup'
      @broadcast "new bidder! #{bidder.name}"
      @broademit "bidder_joined", bidders: (p.id for p in @bidders)
      true
  bidder_left:
    transitions:
      start: 'start'
      active: 'active'
      complete: 'complete'
      payment_pending: 'payment_pending'
      payment_collected: 'payment_collected'
    callback: (bidder) ->
      @bidders = (p for p in @bidders when p != bidder)
      @broadcast "bidder left! #{bidder.name}"
      @broademit "bidder_left", bidders: (p.id for p in @bidders)
      true
  start_auction:
    transitions:
      start: 'active'
    callback: () ->
      @broadcast "auction started "
      @broademit "started"
  stop_auction:
    transitions:
      active: 'complete'
    callback: (admin) ->
      @broadcast "auction stopped"
      @broademit "stopped"
  auction_over:
    transitions:
      active: 'complete'
    callback: () ->
      @broadcast "auction over. Sold!"
      @broademit "over"
      @biddercast @current_bidder, "You've won and it's now time to pay"
      @bidderemit @current_bidder, "winner", value: @current_bid.value, auction_name: @name
  restart_auction:
    transitions:
      start: 'active'
      active: 'active'
      complete: 'active'
      payment_pending: 'active'
      payment_collected: 'active'
      active: 'active'
    callback: (admin) ->
      @broadcast "auction restarted"
      @broademit "restarted"
      @bids = []
      @current_bidder = null
      @current_bid = { value: 0,  name: admin.name, image: admin.image }
      @broademit "newbid", @current_bid
  going_auction:
    transitions:
      active: 'active'
    callback: (admin) ->
      @going1()
  bid:
    transitions:
      active: 'active'
    callback: (bid, bidder) ->
      if @going?
        clearTimeout @going
        @going = null
      bid.name = bidder.name
      bid.image = bidder.image
      # auction logic
      console.log "auction #{@item} got bid #{bid.value} from #{bidder.name}"
      if !@current_bid?
        console.log "first bid accepted #{bid.value} from #{bidder.name}"

        @bids.push bid
        @current_bid = bid
        @current_bidder = bidder
        @broadcast "first bid from #{bidder.name}"
        @biddercast bidder, "bid accepted"
        @broademit "newbid", bid
        @bidderemit bidder, "bidstatus", accepted: true

      if bid.value > @current_bid.value
        console.log "bid accepted"

        @bids.push bid
        @current_bid = bid
        @current_bidder = bidder
        @broadcast "new bid from #{bidder.name}"
        @biddercast bidder, "bid accepted"
        @broademit "newbid", bid
        @bidderemit bidder, "bidstatus", accepted: true
      else
        console.log "bid rejected"
        @biddercast bidder, "sorry, you've been out bid already"
        @bidderemit bidder, "bidstatus", accepted: false


class Auction extends StateMachine
  constructor: (item: @item, description: @description ) ->
    super('start', states, events)
    @bidders = []
    @current_bid = null
    @current_bidder = null
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
     console.log "auction #{@item} bidderemit: #{b.name} #{event}", args...
     b.emit(event, args...)

   biddercast: (b, message) ->
     console.log "auction #{@item} biddercast: #{b.name} #{message}"
     b.emit("broadcast", message: message)
     b.send(message)

   broademit: (event, args...) ->
     console.log "auction #{@item} broademit: #{event}", args...
     b.emit(event, args...) for b in @bidders

   broadcast: (message) ->
     console.log "auction #{@item} broadcast: #{message}"
     b.emit("broadcast", message: message) for b in @bidders
     b.send(message) for b in @bidders

   going1: ->
     @broadcast 'going once'
     @broademit 'going', left: 3
     a = @
     @going = setTimeout ->
       a.broadcast 'going twice'
       a.broademit 'going', left: 2
       a.going = setTimeout  ->
         a.broadcast 'going three times'
         a.broademit 'going', left: 1
         a.going = setTimeout ->
            a.trigger 'auction_over'
            a.broadcast 'Sold'
            a.broademit 'going', left: 0
         , 2500
       , 2500
     , 2500



# create an auction
auction = new Auction({ item: 'Mars Bar', description: 'chocolate bar'})
# until we have admin, make it the global live auction
global.live_auction = auction
# until we have admin, start the auction
auction.trigger('start_auction')

(exports ? window).Auction = Auction

