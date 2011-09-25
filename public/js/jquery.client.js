(function() {
  $(function() {
    var Activity, AdminButtons, Bid, JoinRoom, PageSetup, SocketIO;
    SocketIO = (function() {
      function SocketIO() {
        window.socketIoClient = io.connect();
        socketIoClient.on("connect", function() {
          var $activity;
          $("#status").removeClass("offline").addClass("online").find("p").text("You are online and can bid.");
          $activity = $('#activity');
          if ($activity.length !== 0) {
            $('#activity').empty();
            socketIoClient.emit("activityview");
          }
        });
        socketIoClient.on("activity", function(data) {
          return new Activity(data);
        });
        socketIoClient.on("message", function(msg) {
          return new JoinRoom(msg);
        });
        socketIoClient.on("newbid", function(bid) {
          return new Bid(bid);
        });
        socketIoClient.on("adminbuttons", function() {
          return new AdminButtons();
        });
        socketIoClient.on("winner", function(data) {
          var url;
          window.alert("You have won with a winning bid of £" + data.value + " and will now be redirected to the JustGiving payment page");
          url = "http://www.justgiving.com/donation/direct/charity/2344?amount=" + data.value + "&reference=livebidding-auction-name-" + data.auction_name + "&frequency=single&exitUrl=http%3a%2f%2flivebids.herokuapp.com%2freturn?donationId=JUSTGIVING-DONATION-ID";
          return setTimeout(function() {
            return window.location = url;
          }, 2000);
        });
        socketIoClient.on("disconnect", function() {
          $("#connected").removeClass("on").find("strong").text("Offline");
          return $("#status").removeClass("online").addClass("offline").find("p").text("You are offline. please wait...");
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
        ($('#facebook_button, #google_button, #create_account')).click(function(e) {
          e.preventDefault();
          return alert('Please use twitter');
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
    Activity = (function() {
      function Activity(data) {
        var $html;
        $html = $("<button class=\"going slick-black\">Going</button>\n<button class=\"restart slick-black\">Restart</button>\n<button class=\"stop slick-black\">Stop</button>");
        $('#activity').prepend($html);
      }
      return Activity;
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
