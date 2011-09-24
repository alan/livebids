var settings = {
	'sessionSecret': 'sessionSecret'
	, 'port': 8080
	, 'uri': 'http://local.host:8080' // Without trailing /

	// You can add multiple recipiants for notifo notifications
	, 'notifoAuth': null /*[
		{
			'username': ''
			, 'secret': ''
		}
	]*/

	, 'external': {
		 'twitter': {
      // local.host:8080
			consumerKey: '9EVsAL0C8ktXRUebb5I5hw',
			consumerSecret: '8ZgpyOZAJuBDxqcLLS56Y6D94NS3Q4gk7A3H4Ttlo'
		}
	}

	, 'debug': (process.env.NODE_ENV !== 'production')

};

if (process.env.NODE_ENV == 'production') {
	settings.uri = 'http://livebids.herokuapp.com';
	settings.port = process.env.PORT || 80; // Joyent SmartMachine uses process.env.PORT

  // livebids.heroku.com
  settings.external.twitter.consumerKey = 'PyvdOrZcZsn4qRUy9jbElQ';
  settings.external.twitter.consumerSecret =  'ahHfn56kKVchJnwcA157XGJeIXVRMiWENSMx5WGJdg';

	//settings.airbrakeApiKey = '0190e64f92da110c69673b244c862709'; // Error logging, Get free API key from https://airbrakeapp.com/account/new/Free
}
module.exports = settings;
