(function() {
  var currentPath, doReload;
  jQuery.cookie = function(name, value, options) {
    var cookie, cookieValue, cookies, date, domain, expires, i, path, secure;
    if (typeof value !== "undefined") {
      options = options || {};
      if (value === null) {
        value = "";
        options.expires = -1;
      }
      expires = "";
      if (options.expires && (typeof options.expires === "number" || options.expires.toUTCString)) {
        if (typeof options.expires === "number") {
          date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
          date = options.expires;
        }
        expires = "; expires=" + date.toUTCString();
      }
      path = (options.path ? "; path=" + options.path : "");
      domain = (options.domain ? "; domain=" + options.domain : "");
      secure = (options.secure ? "; secure" : "");
      return document.cookie = [name, "=", encodeURIComponent(value), expires, path, domain, secure].join("");
    } else {
      cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        cookies = document.cookie.split(";");
        i = 0;
        while (i < cookies.length) {
          cookie = jQuery.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === (name + "=")) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
          i++;
        }
      }
      return cookieValue;
    }
  };
  currentPath = window.location.href.replace(new RegExp("https?://" + window.location.host, ""), "");
  doReload = true;
  (function($) {
    var $container, $overlay, $refresh, $toggleOverlay, $toolbar;
    setTimeout((function() {
      var doMoveAjax, reload;
      doMoveAjax = function(url) {
        if (url) {
          return $.ajax({
            url: "/reload-content/",
            data: {
              path: url,
              type: "post",
              cache: false,
              success: function(text) {
                return $(".sync").fadeTo(200, 0.2).fadeTo(200, 1).fadeTo(200, 0.2).fadeTo(200, 1);
              }
            }
          });
        }
      };
      return (reload = function($) {
        return $.ajax({
          url: "/reload-content/",
          cache: false,
          success: function(text) {
            if (text === "css") {
              $("style,link").remove();
              return $("<link rel=\"stylesheet\" href=\"/static/css/" + (0 | Math.random() * 100000) + "/style.css\" type=\"text/css\">").appendTo("head");
            } else if (text === "content") {
              return setTimeout((function() {
                return window.location.reload(true);
              }), 200);
            } else {
              if (text && currentPath !== text) {
                doReload = false;
                return window.location = text;
              }
            }
          },
          complete: function() {
            return setTimeout((function() {
              if (doReload) {
                return reload($);
              }
            }), 1000);
          }
        });
      })($);
    }), 100);
    $toolbar = $("<div id=\"frontend-development\"></div>").appendTo("body");
    $refresh = $("<div title=\"Sync all browasers to this page\" class=\"sync\">S</div>").click(function(event) {
      return doMoveAjax(currentPath);
    }).appendTo($toolbar);
    $toggleOverlay = $("<div title=\"Toggle overlay\" class=\"toggle-overlay\">O</div>").click(function(event) {
      if ($.cookie("do") === "true") {
        $.cookie("do", "false", {
          path: "/"
        });
        return window.location.reload(true);
      } else {
        $.cookie("do", "true", {
          path: "/"
        });
        return window.location.reload(true);
      }
    }).appendTo($toolbar);
    if ($.cookie("do") === "true") {
      $toggleOverlay.addClass("bad");
    } else {
      $toggleOverlay.addClass("ok");
    }
    $overlay = $("#dummy-overlay");
    if ($.cookie("do") === "true") {
      if (($overlay.attr("style") || "").match(/center/)) {
        $overlay.addClass("center");
      }
      $container = $("#dummy-overlay-container").show();
      $("#dummy-overlay").width($("#dummy-overlay").width());
      return $(window).mousemove(function(e) {
        return $container.width((e.clientX - 10) + "px");
      });
    } else {
      return $("#dummy-overlay-container").remove();
    }
  })(jQuery);
}).call(this);
