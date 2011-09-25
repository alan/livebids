$ ->
  class SocketIO
    constructor: ->
      window.socketIoClient = io.connect()


      socketIoClient.on "connect", ->
        $("#connected").addClass("on").find("strong").text "Online"
        $activity = $('#activity')
        if $activity.length != 0
          $('#activity').empty()
          socketIoClient.emit "activityview"
          return

      socketIoClient.on "activity", (data) ->
        new Activity(data)

      socketIoClient.on "message", (msg) ->
        new JoinRoom(msg)

      socketIoClient.on "newbid", (bid) ->
        new Bid(bid)

      socketIoClient.on "adminbuttons", ->
        new AdminButtons()

      socketIoClient.on "winner", (data) ->
        window.alert "You have won with a winning bid of £#{data.value} and will now be redirected to the JustGiving payment page"
        url = "http://www.justgiving.com/donation/direct/charity/2344?amount=#{data.value}&reference=livebidding-auction-name-#{data.auction_name}&frequency=single&exitUrl=http%3a%2f%2flivebids.herokuapp.com%2freturn?donationId=JUSTGIVING-DONATION-ID"
        setTimeout ->
          window.location = url
        , 2000

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

      ($ '#facebook_button, #google_button, #create_account').click (e) ->
        e.preventDefault()
        alert('Please use twitter')

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

  class Activity
    constructor: (data) ->
      $html = $ """
                <button class="going slick-black">Going</button>
                <button class="restart slick-black">Restart</button>
                <button class="stop slick-black">Stop</button>
                """
      $('#activity').prepend $html

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
