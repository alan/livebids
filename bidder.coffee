
EE = if EventEmitter? then EventEmitter else require('events').EventEmitter
Collection = require('./collection').Collection
ClientStateMachine = require('./client_state_machine').ClientStateMachine

class Bidder extends EE
  @last_used_id = 0
  @collection = new Collection()

  constructor: (user: @user, client: @client, sid: @sid) ->
    @sm = new ClientStateMachine(@)
    @id = @user
    @constructor.collection.add @

  new_client: (new_client) ->
    # copy bindings...
    console.log "player #{@name} removing client #{@client.id}"
    new_client._events = @client._events
    @client = new_client
    console.log "player #{@id} added client #{@client.id}"

(exports ? window).Bidder = Bidder

