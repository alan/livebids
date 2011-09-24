(function() {
  (function(b) {
    var a, c, d, _results;
    c = function() {};
    d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info, log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(",");
    _results = [];
    while (a = d.pop()) {
      _results.push(b[a] = b[a] || c);
    }
    return _results;
  })(window.console = window.console || {});
  (function($) {
    var image, service, socketIoClient;
    socketIoClient = io.connect(null, {
      port: "#socketIoPort#",
      rememberTransport: true,
      transports: ["websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket"]
    });
    socketIoClient.on("connect", function() {
      return $("#connected").addClass("on").find("strong").text("Online");
    });
    image = $.trim($("#image").val());
    service = $.trim($("#service").val());
    socketIoClient.on("message", function(msg) {
      var $li;
      $li = $("<li>").text(msg).append($("<img class=\"avatar\">").attr("src", image));
      if (service) {
        $li.append($("<img class=\"service\">").attr("src", service));
      }
      $("#bubble ul").prepend($li);
      $("#bubble").scrollTop(98).stop().animate({
        scrollTop: "0"
      }, 500);
      setTimeout((function() {
        return $li.remove();
      }), 5000);
      return setTimeout((function() {
        return socketIoClient.send("pong");
      }), 1000);
    });
    socketIoClient.on("disconnect", function() {
      return $("#connected").removeClass("on").find("strong").text("Offline");
    });
    return $('body').append(templates.template({
      stooges: ['moe', 'larry', 'curly']
    }));
  })(jQuery);
}).call(this);
