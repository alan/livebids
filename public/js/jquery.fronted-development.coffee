jQuery.cookie = (name, value, options) ->
  unless typeof value == "undefined"
    options = options or {}
    if value == null
      value = ""
      options.expires = -1
    expires = ""
    if options.expires and (typeof options.expires == "number" or options.expires.toUTCString)
      if typeof options.expires == "number"
        date = new Date()
        date.setTime date.getTime() + (options.expires * 24 * 60 * 60 * 1000)
      else
        date = options.expires
      expires = "; expires=" + date.toUTCString()
    path = (if options.path then "; path=" + (options.path) else "")
    domain = (if options.domain then "; domain=" + (options.domain) else "")
    secure = (if options.secure then "; secure" else "")
    document.cookie = [ name, "=", encodeURIComponent(value), expires, path, domain, secure ].join("")
  else
    cookieValue = null
    if document.cookie and document.cookie != ""
      cookies = document.cookie.split(";")
      i = 0
      
      while i < cookies.length
        cookie = jQuery.trim(cookies[i])
        if cookie.substring(0, name.length + 1) == (name + "=")
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        i++
    cookieValue

currentPath = window.location.href.replace(new RegExp("https?://" + window.location.host, ""), "")
doReload = true
(($) ->
  setTimeout (->
    doMoveAjax = (url) ->
      if url
        $.ajax 
          url: "/reload-content/"
          data: path: url
          type: "post"
          cache: false
          success: (text) ->
            $(".sync").fadeTo(200, 0.2).fadeTo(200, 1).fadeTo(200, 0.2).fadeTo 200, 1
    (reload = ($) ->
      $.ajax 
        url: "/reload-content/"
        cache: false
        success: (text) ->
          if text == "css"
            $("style,link").remove()
            $("<link rel=\"stylesheet\" href=\"/static/css/" + (0 | Math.random() * 100000) + "/style.css\" type=\"text/css\">").appendTo "head"
          else if text == "content"
            setTimeout (->
              window.location.reload true
            ), 200
          else
            if text and currentPath != text
              doReload = false
              window.location = text
        
        complete: ->
          setTimeout (->
            reload $  if doReload
          ), 1000
    ) $
  ), 100
  $toolbar = $("<div id=\"frontend-development\"></div>").appendTo("body")
  $refresh = $("<div title=\"Sync all browasers to this page\" class=\"sync\">S</div>").click((event) ->
    doMoveAjax currentPath
  ).appendTo($toolbar)
  $toggleOverlay = $("<div title=\"Toggle overlay\" class=\"toggle-overlay\">O</div>").click((event) ->
    if $.cookie("do") == "true"
      $.cookie "do", "false", path: "/"
      window.location.reload true
    else
      $.cookie "do", "true", path: "/"
      window.location.reload true
  ).appendTo($toolbar)
  if $.cookie("do") == "true"
    $toggleOverlay.addClass "bad"
  else
    $toggleOverlay.addClass "ok"
  $overlay = $("#dummy-overlay")
  if $.cookie("do") == "true"
    $overlay.addClass "center"  if ($overlay.attr("style") or "").match(/center/)
    $container = $("#dummy-overlay-container").show()
    $("#dummy-overlay").width $("#dummy-overlay").width()
    $(window).mousemove (e) ->
      $container.width (e.clientX - 10) + "px"
  else
    $("#dummy-overlay-container").remove()
) jQuery
