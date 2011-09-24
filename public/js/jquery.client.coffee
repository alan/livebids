((b) ->
  c = ->
  d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info, log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(",")

  while a = d.pop()
    b[a] = b[a] or c
) window.console = window.console or {}
(($) ->
  $$ = (->
    cache = {}
    (selector) ->
      cache[selector] = $(selector)  unless cache[selector]
      cache[selector]
  )()
  socketIoClient = io.connect(null,
    port: "#socketIoPort#"
    rememberTransport: true
    transports: [ "websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket" ]
  )
  socketIoClient.on_ "connect", ->
    $$("#connected").addClass("on").find("strong").text "Online"

  image = $.trim($("#image").val())
  service = $.trim($("#service").val())
  socketIoClient.on_ "message", (msg) ->
    $li = $("<li>").text(msg).append($("<img class=\"avatar\">").attr("src", image))
    $li.append $("<img class=\"service\">").attr("src", service)  if service
    $$("#bubble ul").prepend $li
    $$("#bubble").scrollTop(98).stop().animate scrollTop: "0", 500
    setTimeout (->
      $li.remove()
    ), 5000
    setTimeout (->
      socketIoClient.send "pong"
    ), 1000

  socketIoClient.on_ "disconnect", ->
    $$("#connected").removeClass("on").find("strong").text "Offline"
) jQuery
