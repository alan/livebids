$ ->
  class SocketIO
    constructor: ->
      window.socketIoClient = io.connect()


      socketIoClient.on "connect", ->
        $("#status").removeClass("offline").addClass("online").find("p").text "You are online and can bid."
        $activity = $('#activity')
        if $activity.length != 0
          $('#activity').empty()
          socketIoClient.emit "activityview"
          return

      socketIoClient.on "activity", (data) ->
        console.log "activity", data
        new Activity(data)

      socketIoClient.on "message", (msg) ->
        new JoinRoom(msg)

      socketIoClient.on "newbid", (bid) ->
        new Bid(bid)

      socketIoClient.on "adminbuttons", ->
        new AdminButtons()

      socketIoClient.on "going", (data) ->
        $("#status").find("p").text data.message

      socketIoClient.on "over", (data) ->
        $("#status").find("p").text "Sold to #{data.name} for &pound; #{data.value}"

      socketIoClient.on "winner", (data) ->
        window.alert "You have won with a winning bid of £#{data.value} and will now be redirected to the JustGiving payment page"
        url = "http://www.justgiving.com/donation/direct/charity/2344?amount=#{data.value}&reference=livebidding-auction-name-#{data.auction_name}&frequency=single&exitUrl=http%3a%2f%2flivebids.herokuapp.com%2freturn?donationId=JUSTGIVING-DONATION-ID"
        setTimeout ->
          window.location = url
        , 2000

      socketIoClient.on "disconnect", ->
        $("#connected").removeClass("on").find("strong").text "Offline"
        $("#status").removeClass("online").addClass("offline").find("p").text "You are offline. please wait..."

  class PageSetup
    constructor: ->
      $('button.bid').live 'click', ->
        currentbid = $('#currentbid').data('currentbid')
        if currentbid?
          nextbid =  currentbid + 1
        else
          nextbid = 1
        console.log("Next bid #{nextbid}")
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
      if data.what == 'newbidder'
        $html = $ """
                  <div class="activity">
                    <span>New Bidder: #{data.name}</span>
                    <img src="#{data.image}"/>
                  </div>
                  """
      $('#activity').prepend $html

  class Bid
    constructor: (bid_data) ->
      $currentbid = $('#currentbid')
      if !$currentbid[0]?
        $currentbid = $('<div id="currentbid"/>')
        $currentbid.appendTo('body')
      $currentbid.data 'currentbid', bid_data.value
      $currentbid.html "&pound; #{bid_data.value} Highest bid by <img class=\"avatar\" src=\"#{bid_data.image}\"> #{bid_data.name}"

      ($ '.myBidButton').html "Bid &pound; #{bid_data.value + 1} Now"
      ($ '#status').find("p").text "You are online and can bid."


  class JoinRoom
    constructor: (msg)->
      image = $.trim($("#image").val())
      service = $.trim($("#service").val())

      service = $.trim(($ '#service').val())
      ($ "#bubble ul").prepend templates.joiner(data: {msg: msg, img_src: image, service: service.toString()})

  new SocketIO()
  new PageSetup()
