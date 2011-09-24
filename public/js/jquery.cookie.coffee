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
