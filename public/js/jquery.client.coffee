((b) ->
  c = ->
  d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info, log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(",")

  while a = d.pop()
    b[a] = b[a] or c
) window.console = window.console or {}
(($) ->
  socketIoClient = io.connect(null,
    port: "#socketIoPort#"
    rememberTransport: true
    transports: [ "websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket" ]
  )
  socketIoClient.on "connect", ->
    $("#connected").addClass("on").find("strong").text "Online"

  image = $.trim($("#image").val())
  service = $.trim($("#service").val())
  socketIoClient.on "message", (msg) ->
    img_src = $("<img class=\"avatar\">").attr("src", image)
    $("#bubble ul").prepend templates.template(data: {msg: msg, img_src: img_src})
    $("#bubble").scrollTop(98).stop().animate scrollTop: "0", 500

    setTimeout (->
      socketIoClient.send "pong"
    ), 1000

  socketIoClient.on "disconnect", ->
    $("#connected").removeClass("on").find("strong").text "Offline"

) jQuery
