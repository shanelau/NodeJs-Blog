
/**
 * Module dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = express();

// all environments
app.configure(function(){
    app.set('port', process.env.PORT || 3001);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(partials());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(flash());
    app.use(express.session({
        secret: settings.cookieSecret,
        Store: new MongoStore({
            db: settings.db
        })
    }));
    //app.dynamicHelpers
    app.use(function(req, res, next){
        res.locals.csrf = req.session ? req.session._csrf : '';
        res.locals.req = req;
        res.locals.session = req.session;
        res.locals.user = req.session.user;

        var err = req.flash('error');
        if(err.length)
            res.locals.error = err;
        else
            res.locals.error = null;
        var succ = req.flash('success');
        if(succ.length)
            res.locals.success = succ;
        else
            res.locals.success = null;

        next();
    });
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
