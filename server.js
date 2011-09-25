(function() {
  var Bidder, DummyHelper, NotFound, airbrake, app, assetHandler, assetManager, assetsMiddleware, assetsSettings, authentication, connect, dummyHelpers, express, insertSocketIoPort, notifoMiddleware, sessionStore, siteConf, socketIo;
  NotFound = function(msg) {
    this.name = "NotFound";
    Error.call(this, msg);
    return Error.captureStackTrace(this, arguments.callee);
  };
  siteConf = require("./lib/getConfig");
  process.title = siteConf.uri.replace(/http:\/\/(www)?/, "");
  if (siteConf.airbrakeApiKey) {
    airbrake = require("airbrake").createClient(siteConf.airbrakeApiKey);
  }
  process.addListener("uncaughtException", function(err, stack) {
    console.log("Caught exception: " + err + "\n" + err.stack);
    console.log("\u0007");
    if (airbrake) {
      return airbrake.notify(err);
    }
  });
  connect = require("connect");
  express = require("express");
  assetManager = require("connect-assetmanager");
  assetHandler = require("connect-assetmanager-handlers");
  notifoMiddleware = require("connect-notifo");
  DummyHelper = require("./lib/dummy-helper");
  Bidder = require("./bidder").Bidder;
  sessionStore = new express.session.MemoryStore();
  app = module.exports = express.createServer();
  app.listen(siteConf.port, null);
  socketIo = new require("./lib/socket-io-server.js")(app, sessionStore);
  authentication = new require("./lib/authentication.js")(app, siteConf);
  assetsSettings = {
    js: {
      route: /\/static\/js\/[a-z0-9]+\/.*\.js/,
      path: "./public/js/",
      dataType: "javascript",
      files: ["http://code.jquery.com/jquery-latest.js", siteConf.uri + "/socket.io/socket.io.js", "jquery.client.js"],
      debug: true,
      postManipulate: {
        "^": [
          assetHandler.uglifyJsOptimize, insertSocketIoPort = function(file, path, index, isLast, callback) {
            return callback(file.replace(/.#socketIoPort#./, siteConf.port));
          }
        ]
      }
    },
    css: {
      route: /\/static\/css\/[a-z0-9]+\/.*\.css/,
      path: "./public/css/",
      dataType: "css",
      files: ["reset.css", "client.css"],
      debug: true,
      postManipulate: {
        "^": [assetHandler.fixVendorPrefixes, assetHandler.fixGradients, assetHandler.replaceImageRefToBase64(__dirname + "/public"), assetHandler.yuiCssOptimize]
      }
    }
  };
  app.configure("development", function() {
    return [["js", "updatedContent"], ["css", "updatedCss"]].forEach(function(group) {
      var triggerUpdate;
      return assetsSettings[group[0]].postManipulate["^"].push(triggerUpdate = function(file, path, index, isLast, callback) {
        callback(file);
        return dummyHelpers[group[1]]();
      });
    });
  });
  assetsMiddleware = assetManager(assetsSettings);
  app.configure(function() {
    app.set("view engine", "ejs");
    return app.set("views", __dirname + "/views");
  });
  app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(assetsMiddleware);
    app.use(express.session({
      store: sessionStore,
      secret: siteConf.sessionSecret
    }));
    app.use(express.logger({
      format: ":response-time ms - :date - :req[x-real-ip] - :method :url :user-agent / :referrer"
    }));
    app.use(authentication.middleware.auth());
    app.use(authentication.middleware.normalizeUserData());
    app.use(express["static"](__dirname + "/public", {
      maxAge: 86400000
    }));
    if (siteConf.notifoAuth) {
      return app.use(notifoMiddleware(siteConf.notifoAuth, {
        filter: function(req, res, callback) {
          return callback(null, !req.xhr && !(req.headers["x-real-ip"] || req.connection.remoteAddress).match(/192.168./));
        },
        format: function(req, res, callback) {
          return callback(null, {
            title: ":req[x-real-ip]/:remote-addr @ :req[host]",
            message: ":response-time ms - :date - :req[x-real-ip]/:remote-addr - :method :user-agent / :referrer"
          });
        }
      }));
    }
  });
  app.configure("development", function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return app.all("/robots.txt", function(req, res) {
      return res.send("User-agent: *\nDisallow: /", {
        "Content-Type": "text/plain"
      });
    });
  });
  app.configure("production", function() {
    app.use(express.errorHandler());
    return app.all("/robots.txt", function(req, res) {
      return res.send("User-agent: *", {
        "Content-Type": "text/plain"
      });
    });
  });
  app.dynamicHelpers({
    assetsCacheHashes: function(req, res) {
      return assetsMiddleware.cacheHashes;
    },
    session: function(req, res) {
      return req.session;
    }
  });
  app.error(function(err, req, res, next) {
    console.log(err);
    if (airbrake) {
      airbrake.notify(err);
    }
    if (err instanceof NotFound) {
      return res.render("errors/404");
    } else {
      return res.render("errors/500");
    }
  });
  app.all("/", function(req, res) {
    if (!req.session.uid) {
      req.session.uid = 0 | Math.random() * 1000000;
    }
    res.locals({
      key: "value"
    });
    return res.render("index");
  });
  dummyHelpers = new DummyHelper(app);
  app.all("*", function(req, res) {
    throw new NotFound;
  });
  console.log("Running in " + (process.env.NODE_ENV || "development") + " mode @ " + siteConf.uri);
}).call(this);
