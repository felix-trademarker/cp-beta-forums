// CALL ENV FILE
require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const expressLayouts = require('express-ejs-layouts');
var cron = require('node-cron');
var flash = require('express-flash-2');

let migrationService = require('./services/migrationService')

var app = express();

app.use(fileUpload());
app.use(bodyParser.json())
app.use(cookieParser())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
// app.use(lessMiddleware({
//   src: path.join(__dirname, 'public'),
//   dest: __dirname+"public/beta/stylesheets/",
//   force: true,
//   debug: true
// }));


if ( process.env.ENVIRONMENT != "dev" ) {
  app.use(express.static(path.join(__dirname, 'public'), {
     maxAge: (60 * 60 * 1000 * 24) * 1
    //maxAge: 5 * 1000
  }))
} else {
  app.use(express.static(path.join(__dirname, 'public') ));
}


app.use(session({
  secret: 'secretshhhhhh',
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge: 1000 * 60 * 60 * 24
  }
}))
// SESSION STORE ============ <<

app.use(flash());

app.use(expressLayouts);
// app.use(cors())

// APP  CONTAINER =========== >> 
let conn = require('./config/DbConnect');
conn.connectToServer( function( err, client ) { // MAIN MONGO START
  console.log("connecting to server....");
  if (err) console.log(err);
  // start the rest of your app here
  
  // Create our number formatter.
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  app.locals.formatter = formatter;
  app.locals.moment = require('moment');
  app.locals.helpers = require('./helpers');
  
  // 

  app.set('layout', 'layouts/public-layout');
  
  // ROUTE HANDLER ============ >>
  var middleware = require('./middleware');
  
  var dashboardRouter = require('./routes/dashboard');
  var authRouter = require('./routes/auth');
  var apiRouter = require('./routes/api');
  // app.use('/api/v1', apiRouter);
  // app.use('/', publicRouter);
  // app.use('/', authRouter);
  app.use('/', dashboardRouter);
  app.use(['/api/v1','/beta/api/v1'], apiRouter);

  // ROUTE HANDLER ============ <<
  cron.schedule('*/2 * * * * *', () => {
    // migrationService.contents()

    // migrationService.default('vocabulary')
    // migrationService.users()

    // migrationService.default('user_options')
    // migrationService.default('user_addresses')


    // migrationService.default('comments')
    // migrationService.default('content_rates')
    // migrationService.default('contents_notes')
    // migrationService.default('contents_series')
    
  });
  // migrationService.users()
  // let data={}
  // let variable = "var2"
  // let var2 = { ...variable : 'asd' }
  // let value = "value test"
  // data.this[variable].value = value
  // console.log(var2)

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    // errorLogService.logger(404,"page 404",req)
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {

    
    // set locals, only providing error in development
    if ( process.env.ENVIRONMENT == "dev" ) {

      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'dev' ? err : {};
      res.status(err.status || 500);
      res.render('error');

    } else {
      // errorLogService.logger(err.status || 500,err.message,req)
      res.status(err.status || 500);
      res.redirect("/")
    }
  });

}); // MAIN MONGO CLOSE
// APP  CONTAINER =========== << 


module.exports = app;
