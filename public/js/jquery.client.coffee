$ ->
  image = $.trim($("#image").val())
  service = $.trim($("#service").val())

  ($ 'body').bind 'message', (e, msg) ->
    $("#bubble ul").prepend templates.template(data: {msg: msg})
    $("#bubble").scrollTop(98).stop().animate scrollTop: "0", 500

  socketIoClient = io.connect(null,
    port: "#socketIoPort#"
    rememberTransport: true
    transports: [ "websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket" ]
  )
  socketIoClient.on "connect", ->
    $("#connected").addClass("on").find("strong").text "Online"

  socketIoClient.on "message", (msg) ->
    ($ 'body').trigger('message', [msg])
    setTimeout (->
      socketIoClient.send "pong"
    ), 1000

  socketIoClient.on "message", (msg) ->
    ($ 'body').trigger('message', ['i am also listing on message'])

  socketIoClient.on "disconnect", ->
    $("#connected").removeClass("on").find("strong").text "Offline"
