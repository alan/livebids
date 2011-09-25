module.exports = function Server(expressInstance, sessionStore) {
	var parseCookie = require('connect').utils.parseCookie;
	//var io = require('socket.io').listen(expressInstance);
	global.io = require('socket.io').listen(expressInstance);

  var   Bidder = require("../bidder").Bidder;

	io.configure(function () {
		io.set('log level', 0);
	});

	io.set('authorization', function(handshakeData, ack) {
		var cookies = parseCookie(handshakeData.headers.cookie);
		sessionStore.get(cookies['connect.sid'], function(err, sessionData) {
			handshakeData.session = sessionData || {};
			handshakeData.sid = cookies['connect.sid']|| null;
			ack(err, err ? false : true);
		});
	});

	io.sockets.on('connection', function(client) {
		var user = client.handshake.session.user;
    if (user ) {

      var name = client.handshake.session.user.name;
      var image = client.handshake.session.user.image;
      var bidder = Bidder.collection.get(name);

      if (bidder) {
        console.log('reconnected ' + user + ' to bidder. client.id:' + client.id);
        bidder.new_client(client);

      } else {
        console.log('new bidder for  ' + user + ' client.id:' + client.id);
        bidder = new Bidder({user:user, sid: client.handshake.sid, client: client, image: image});
      }

      // Join user specific channel, this is good so content is send across user tabs.
      client.join(client.handshake.sid);

      client.send('welcome: '+user);
    }else {
      client.send('please log in');
    }

      client.on('message', function(msg) {
        // Send back the message to the users room.
        //io.sockets.in(client.handshake.sid).send('socket.io relay message "'+msg+'" from: '+ user +' @ '+new Date().toString().match(/[0-9]+:[0-9]+:[0-9]+/));
      });

		client.on('disconnect', function() { console.log('disconnect'); });
	});

	io.sockets.on('error', function(){ console.log(arguments); });

	return io;

};

