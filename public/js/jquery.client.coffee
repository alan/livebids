$ ->
  class SocketIO
    constructor: ->
      window.socketIoClient = io.connect()

      socketIoClient.on "connect", ->
        $("#connected").addClass("on").find("strong").text "Online"

      socketIoClient.on "message", (msg) ->
        new JoinRoom(msg)

      socketIoClient.on "newbid", (bid) ->
        new Bid(bid)

      socketIoClient.on "adminbuttons", ->
        console.log('got adminbuttons')
        new AdminButtons()

      socketIoClient.on "disconnect", ->
        $("#connected").removeClass("on").find("strong").text "Offline"

  class PageSetup
    constructor: ->
      $('body').prepend('<button class="bid fat-blue"> make bid </a>')
      $('button.bid').live 'click', ->
        current_bid = $('#current_bid').data('current_bid')
        if current_bid?
          nextbid =  current_bid + 1
        else
          nextbid = 1
        socketIoClient.emit 'bid', value: nextbid

  class AdminButtons
    constructor: ->
      $('button.going').live 'click', -> socketIoClient.emit 'going_auction'
      $('button.restart').live 'click', -> socketIoClient.emit 'restart_auction'
      $('button.stop').live 'click', -> socketIoClient.emit 'stop_auction'
      $html = $ """
                <button class="going slick-black">Going</button>
                <button class="restart slick-black">Restart</button>
                <button class="stop slick-black">Stop</button>
                """
      $('body').prepend $html

  class Bid
    constructor: (bid_data) ->
      $current_bid = $('#current_bid')
      if !$current_bid[0]?
        $current_bid = $('<div id="current_bid"/>')
        $current_bid.appendTo('body')
      $current_bid.data 'current_bid', bid_data.value
      $current_bid.html "<img class=\"avatar\" src=\"#{bid_data.image}\"> <span>current bid is: #{bid_data.value} from #{bid_data.name}</span>"

  class JoinRoom
    constructor: (msg)->
      image = $.trim($("#image").val())
      service = $.trim($("#service").val())

      service = $.trim(($ '#service').val())
      ($ "#bubble ul").prepend templates.joiner(data: {msg: msg, img_src: image, service: service.toString()})

  new SocketIO()
  new PageSetup()
