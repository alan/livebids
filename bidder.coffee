
EE = if EventEmitter? then EventEmitter else require('events').EventEmitter
Collection = require('./collection').Collection
Auction = require('./auction').Auction

class Bidder extends EE
  @last_used_id = 0
  @collection = new Collection()

  constructor: (name: @name, client: client, sid: @sid, image: @image) ->
    @constructor.collection.add @
    @new_client(client)
    @state = "logged_out"
    global.io.sockets.in('/activity').emit('activity', what: 'newbidder', name: @name, image: @image)

    # unil we have workflow, join this bidder the live auction
    global.live_auction.trigger 'bidder_joined', @

  new_client: (new_client) ->
    # set up bindings required....
    new_client.on 'trigger', (data) =>
      console.log "got #{@name}:#{new_client.id} trigger: ", data

    new_client.on 'bid', (data) =>
      console.log "got bid #{@name}:#{new_client.id} bid: ", data
      if global.live_auction?
        global.live_auction.trigger 'bid', data, @
      else
        console.log "no global live_auction to trigger bid to"

    new_client.on 'activityview',  =>
      new_client.leave('/' + @sid)
      new_client.join('activity')

    if @name == 'bids live'
      console.log "admin actions for new connected client"
      @emit 'adminbuttons'
      new_client.on 'stop_auction', () =>
        if global.live_auction?
          global.live_auction.trigger 'stop_auction', @
        else
          console.log "no global live_auction to trigger stop to"

      new_client.on 'going_auction', () =>
        if global.live_auction?
          global.live_auction.trigger 'going_auction', @
        else
          console.log "no global live_auction to trigger stop to"

      new_client.on 'restart_auction', () =>
        if global.live_auction?
          global.live_auction.trigger 'restart_auction', @
        else
          console.log "no global live_auction to trigger stop to"


    @emit 'state', state: @state

    if global.live_auction? and global.live_auction.current_bid?
      @emit 'newbid', global.live_auction.current_bid

  login: ->
    @state = "logged_in"

  logout: ->
    @state = "logged_out"

  # wrapper function to emit to the sid room
  emit: (name, args) ->
    global.io.sockets.in(@sid).emit(name, args)

  send: (message) ->
    global.io.sockets.in(@sid).send(message)

(exports ? window).Bidder = Bidder

