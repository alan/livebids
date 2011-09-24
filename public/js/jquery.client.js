(function() {
  $(function() {
    var image, service, socketIoClient;
    image = $.trim($("#image").val());
    service = $.trim($("#service").val());
    ($('body')).bind('message', function(e, msg) {
      $("#bubble ul").prepend(templates.template({
        data: {
          msg: msg
        }
      }));
      return $("#bubble").scrollTop(98).stop().animate({
        scrollTop: "0"
      }, 500);
    });
    socketIoClient = io.connect(null, {
      port: "#socketIoPort#",
      rememberTransport: true,
      transports: ["websocket", "xhr-multipart", "xhr-polling", "htmlfile", "flashsocket"]
    });
    socketIoClient.on("connect", function() {
      return $("#connected").addClass("on").find("strong").text("Online");
    });
    socketIoClient.on("message", function(msg) {
      ($('body')).trigger('message', [msg]);
      return setTimeout((function() {
        return socketIoClient.send("pong");
      }), 1000);
    });
    socketIoClient.on("message", function(msg) {
      return ($('body')).trigger('message', ['i am also listing on message']);
    });
    return socketIoClient.on("disconnect", function() {
      return $("#connected").removeClass("on").find("strong").text("Offline");
    });
  });
}).call(this);
