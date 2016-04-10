require('runtimer');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config/config');
var session = require('express-session');
var routing = express.Router();

//auth provider middleware
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var DropboxStrategy = require('passport-dropbox-oauth2').OAuth2Strategy;
var DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
//require('passport-dropbox').Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    secret: config.session_name,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: false
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

//passport config
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//configure google login
passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.returnURL
},
function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}
));

//configure dropbox login
passport.use(new DropboxOAuth2Strategy({
    clientID: config.dropbox.apikey,
    clientSecret: config.dropbox.appSecret,
    callbackURL: config.dropbox.returnURL
},
function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
        var ret = {
            token: token,
            tokenSecret: tokenSecret,
            profile: profile
        };
        return done(null, ret);
    });
}
));

var router = new (require('./routes/routes'));
app.passport = passport;
router.init(app, routing);
router.route();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.locals.pretty = true;
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.on('listening', function () {
    console.log('server is running already.');
});

var server = app.listen(config.port);
require('./application/socket')(server);

console.log('server started at: ' + config.port);

module.exports = app;
