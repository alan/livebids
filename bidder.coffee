
EE = if EventEmitter? then EventEmitter else require('events').EventEmitter
Collection = require('./collection').Collection
ClientStateMachine = require('./client_state_machine').ClientStateMachine

class Bidder extends EE
  @last_used_id = 0
  @collection = new Collection()

  constructor: (user: @user, client: client, sid: @sid) ->
    @sm = new ClientStateMachine(@)
    @id = @user
    @constructor.collection.add @
    @new_client(client)

  new_client: (new_client) ->
    # set up bindings required....
    new_client.on 'trigger', (data) =>
      console.log "got #{@user}:#{new_client.id} trigger: ", data
      @sm.trigger data.trigger, data

  # wrapper function to emit to the sid room
  emit: (name, args) ->
    global.io.sockets.in(@sid).emit(name, args)

(exports ? window).Bidder = Bidder

