var settings = {
	'sessionSecret': 'sessionSecret'
	, 'port': 8080
	, 'uri': 'http://localhost:8080' // Without trailing /

	// You can add multiple recipiants for notifo notifications
	, 'notifoAuth': null /*[
		{
			'username': ''
			, 'secret': ''
		}
	]*/

	, 'external': {
		 'twitter': {
			consumerKey: 'PyvdOrZcZsn4qRUy9jbElQ',
			consumerSecret: 'ahHfn56kKVchJnwcA157XGJeIXVRMiWENSMx5WGJdg'
		}
	}

	, 'debug': (process.env.NODE_ENV !== 'production')

};

if (process.env.NODE_ENV == 'production') {
	settings.uri = 'http://livebids.herokuapp.com';
	settings.port = process.env.PORT || 80; // Joyent SmartMachine uses process.env.PORT

	//settings.airbrakeApiKey = '0190e64f92da110c69673b244c862709'; // Error logging, Get free API key from https://airbrakeapp.com/account/new/Free
}
module.exports = settings;
