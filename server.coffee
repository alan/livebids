NotFound = (msg) ->
  @name = "NotFound"
  Error.call this, msg
  Error.captureStackTrace this, arguments.callee
siteConf = require("./lib/getConfig")
process.title = siteConf.uri.replace(/http:\/\/(www)?/, "")

airbrake = require("airbrake").createClient(siteConf.airbrakeApiKey)  if siteConf.airbrakeApiKey
process.addListener "uncaughtException", (err, stack) ->
  console.log "Caught exception: " + err + "\n" + err.stack
  console.log "\u0007"
  airbrake.notify err  if airbrake

connect = require("connect")
express = require("express")
assetManager = require("connect-assetmanager")
assetHandler = require("connect-assetmanager-handlers")
notifoMiddleware = require("connect-notifo")
DummyHelper = require("./lib/dummy-helper")
Bidder = require("./bidder").Bidder


#RedisStore = require("connect-redis")(express)
#sessionStore = new RedisStore
sessionStore = new express.session.MemoryStore()
app = module.exports = express.createServer()
app.listen siteConf.port, null
socketIo = new require("./lib/socket-io-server.js")(app, sessionStore)
authentication = new require("./lib/authentication.js")(app, siteConf)
assetsSettings =
  js:
    route: /\/static\/js\/[a-z0-9]+\/.*\.js/
    path: "./public/js/"
    dataType: "javascript"
    files: [ "http://code.jquery.com/jquery-latest.js", siteConf.uri + "/socket.io/socket.io.js", "jquery.client.js" ]
    debug: true
    postManipulate: "^": [ assetHandler.uglifyJsOptimize, insertSocketIoPort = (file, path, index, isLast, callback) -> callback file.replace(/.#socketIoPort#./, siteConf.port) ]
  css:
    route: /\/static\/css\/[a-z0-9]+\/.*\.css/
    path: "./public/css/"
    dataType: "css"
    files: [ "reset.css", "client.css" ]
    debug: true
    postManipulate: "^": [ assetHandler.fixVendorPrefixes, assetHandler.fixGradients, assetHandler.replaceImageRefToBase64(__dirname + "/public"), assetHandler.yuiCssOptimize ]

app.configure "development", ->
  [ [ "js", "updatedContent" ], [ "css", "updatedCss" ] ].forEach (group) ->
    assetsSettings[group[0]].postManipulate["^"].push triggerUpdate = (file, path, index, isLast, callback) ->
      callback file
      dummyHelpers[group[1]]()

assetsMiddleware = assetManager(assetsSettings)
app.configure ->
  app.set "view engine", "ejs"
  app.set "views", __dirname + "/views"

app.configure ->
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use assetsMiddleware
  app.use express.session(
    store: sessionStore
    secret: siteConf.sessionSecret
  )
  app.use express.logger(format: ":response-time ms - :date - :req[x-real-ip] - :method :url :user-agent / :referrer")
  app.use authentication.middleware.auth()
  app.use authentication.middleware.normalizeUserData()
  app.use express["static"](__dirname + "/public", maxAge: 86400000)
  if siteConf.notifoAuth
    app.use notifoMiddleware(siteConf.notifoAuth, 
      filter: (req, res, callback) ->
        callback null, (not req.xhr and not (req.headers["x-real-ip"] or req.connection.remoteAddress).match(/192.168./))
      
      format: (req, res, callback) ->
        callback null, 
          title: ":req[x-real-ip]/:remote-addr @ :req[host]"
          message: ":response-time ms - :date - :req[x-real-ip]/:remote-addr - :method :user-agent / :referrer"
    )

app.configure "development", ->
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )
  app.all "/robots.txt", (req, res) ->
    res.send "User-agent: *\nDisallow: /", "Content-Type": "text/plain"

app.configure "production", ->
  app.use express.errorHandler()
  app.all "/robots.txt", (req, res) ->
    res.send "User-agent: *", "Content-Type": "text/plain"

app.dynamicHelpers
  assetsCacheHashes: (req, res) ->
    assetsMiddleware.cacheHashes
  session: (req, res) ->
    req.session

app.error (err, req, res, next) ->
  console.log err
  airbrake.notify err  if airbrake
  if err instanceof NotFound
    res.render "errors/404"
  else
    res.render "errors/500"

app.all "/", (req, res) ->
  req.session.uid = (0 | Math.random() * 1000000)  unless req.session.uid
  res.locals key: "value"
  res.render "index"

dummyHelpers = new DummyHelper(app)
app.all "*", (req, res) ->
  throw new NotFound

console.log "Running in " + (process.env.NODE_ENV or "development") + " mode @ " + siteConf.uri
