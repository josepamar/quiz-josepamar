var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

var timeSession = 0;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Qiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function(req, res, next){
    if (!req.session.redir){
        req.session.redir = '/';
    }
    //guardar path en session.redir para despues de login volver a la misma vista del login
   if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;   // req.path es le path de donde se hizo el login
    }

    // hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

    
// Auto-logout session
app.use(function(req, res, next){
    var time = new Date();
    var hour = time.getHours();
    var min = time.getMinutes();
    var actualtime = (59 * hour) + min;
    if (req.session.user){
        if (!timeSession) {
            timeSession = actualtime;
        }
        else if ((actualtime - timeSession) < 2){
            timeSession = actualtime;
        }
        else {
            delete req.session.user;
            res.redirect('/login');
            timeSession = 0;
        }
    }
    next();
});


app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err, 
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
        errors: []
    });
});


module.exports = app;
