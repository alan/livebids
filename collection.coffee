
EE = if EventEmitter? then EventEmitter else require('events').EventEmitter

class Collection extends EE
  constructor: ->
    @hash = {}

  add: (item) ->
    @hash[item.id || item.name] = item
    @emit 'add', item
    @emit 'change', item

  get: (name) -> @hash[name]

  list: -> (name for name, item of @hash)

  all: -> (item for name, item of @hash)

  remove: (name) ->
    item = @hash[name]
    delete @hash[name]
    @emit 'remove', item
    @emit 'change', item

  hash: -> @hash


(exports ? window).Collection = Collection

