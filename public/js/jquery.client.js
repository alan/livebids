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
    var image, service;
    window.socketIoClient = io.connect(null, {
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
      var img_src;
      img_src = $("<img class=\"avatar\">").attr("src", image);
      $("#bubble ul").prepend(templates.template({
        data: {
          msg: msg,
          img_src: img_src
        }
      }));
      $("#bubble").scrollTop(98).stop().animate({
        scrollTop: "0"
      }, 500);
      return setTimeout((function() {
        return socketIoClient.send("pong");
      }), 6000);
    });
    socketIoClient.on("newbid", function(bid) {
      var $current_bid;
      $current_bid = $('#current_bid');
      if (!($current_bid[0] != null)) {
        $current_bid = $('<div id="#current_bid"/>');
        $current_bid.prependTo('body');
      }
      $current_bid.data('current_bid', bid.value);
      return $current_bid.text("current bid is: " + bid.value);
    });
    return socketIoClient.on("disconnect", function() {
      return $("#connected").removeClass("on").find("strong").text("Offline");
    });
  })(jQuery);
  $('button.bid').live('click', function() {
    var current_bid, nextbid;
    current_bid = $('#current_bid').data('current_bid');
    if (current_bid != null) {
      nextbid = current_bid + 1;
    } else {
      nextbid = 1;
    }
    return socketIoClient.emit('bid', {
      value: nextbid
    });
  });
}).call(this);
