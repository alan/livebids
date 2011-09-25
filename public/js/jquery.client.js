(function() {
  $(function() {
    var Bid, JoinRoom, PageSetup, SocketIO;
    SocketIO = (function() {
      function SocketIO() {
        window.socketIoClient = io.connect();
        socketIoClient.on("connect", function() {
          return $("#connected").addClass("on").find("strong").text("Online");
        });
        socketIoClient.on("message", function(msg) {
          return new JoinRoom(msg);
        });
        socketIoClient.on("newbid", function(bid) {
          return new Bid(bid);
        });
        socketIoClient.on("disconnect", function() {
          return $("#connected").removeClass("on").find("strong").text("Offline");
        });
      }
      return SocketIO;
    })();
    PageSetup = (function() {
      function PageSetup() {
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
      }
      return PageSetup;
    })();
    Bid = (function() {
      function Bid(bid_data) {
        var $current_bid;
        $current_bid = $('#current_bid');
        if (!($current_bid[0] != null)) {
          $current_bid = $('<div id="current_bid"/>');
          $current_bid.prependTo('body');
        }
        $current_bid.data('current_bid', bid_data.value);
        $current_bid.text("current bid is: " + bid_data.value);
      }
      return Bid;
    })();
    JoinRoom = (function() {
      function JoinRoom(msg) {
        var image, service;
        image = $.trim($("#image").val());
        service = $.trim($("#service").val());
        service = $.trim(($('#service')).val());
        ($("#bubble ul")).prepend(templates.joiner({
          data: {
            msg: msg,
            img_src: image,
            service: service.toString()
          }
        }));
      }
      return JoinRoom;
    })();
    new SocketIO();
    return new PageSetup();
  });
}).call(this);
