(function() {
  $(function() {
    var AdminButtons, Bid, JoinRoom, PageSetup, SocketIO;
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
        socketIoClient.on("adminbuttons", function() {
          console.log('got adminbuttons');
          return new AdminButtons();
        });
        socketIoClient.on("disconnect", function() {
          return $("#connected").removeClass("on").find("strong").text("Offline");
        });
      }
      return SocketIO;
    })();
    PageSetup = (function() {
      function PageSetup() {
        $('body').prepend('<button class="bid fat-blue"> make bid </a>');
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
    AdminButtons = (function() {
      function AdminButtons() {
        var $html;
        $('button.going').live('click', function() {
          return socketIoClient.emit('going_auction');
        });
        $('button.restart').live('click', function() {
          return socketIoClient.emit('restart_auction');
        });
        $('button.stop').live('click', function() {
          return socketIoClient.emit('stop_auction');
        });
        $html = $("<button class=\"going slick-black\">Going</button>\n<button class=\"restart slick-black\">Restart</button>\n<button class=\"stop slick-black\">Stop</button>");
        $('body').prepend($html);
      }
      return AdminButtons;
    })();
    Bid = (function() {
      function Bid(bid_data) {
        var $current_bid;
        $current_bid = $('#current_bid');
        if (!($current_bid[0] != null)) {
          $current_bid = $('<div id="current_bid"/>');
          $current_bid.appendTo('body');
        }
        $current_bid.data('current_bid', bid_data.value);
        $current_bid.html("<img class=\"avatar\" src=\"" + bid_data.image + "\"> <span>current bid is: " + bid_data.value + " from " + bid_data.name + "</span>");
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
