$ ->
  class SocketIO
    constructor: ->
      window.socketIoClient = io.connect(null,
        port: "#socketIoPort#"
        rememberTransport: true
        transports: [ "websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket" ]
      )

      socketIoClient.on "connect", ->
        $("#connected").addClass("on").find("strong").text "Online"

      socketIoClient.on "message", (msg) ->
        new JoinRoom(msg)

      socketIoClient.on "newbid", (bid) ->
        new Bid(bid)

      socketIoClient.on "disconnect", ->
        $("#connected").removeClass("on").find("strong").text "Offline"

  class PageSetup
    constructor: ->
      $('button.bid').live 'click', ->
        current_bid = $('#current_bid').data('current_bid')
        if current_bid?
          nextbid =  current_bid + 1
        else
          nextbid = 1
        socketIoClient.emit 'bid', value: nextbid

  class Bid
    constructor: (bid_data) ->
      $current_bid = $('#current_bid')
      if !$current_bid[0]?
        $current_bid = $('<div id="current_bid"/>')
        $current_bid.prependTo('body')
      $current_bid.data 'current_bid', bid_data.value
      $current_bid.text "current bid is: #{bid_data.value}"

  class JoinRoom
    constructor: (msg)->
      image = $.trim($("#image").val())
      service = $.trim($("#service").val())

      service = $.trim(($ '#service').val())
      ($ "#bubble ul").prepend templates.joiner(data: {msg: msg, img_src: image, service: service.toString()})

  new SocketIO()
  new PageSetup()
