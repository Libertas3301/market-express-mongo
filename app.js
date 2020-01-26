const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressHBS = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

const router = require('./routes/index');
const app = express();
url = process.env.MONGODB_URI || "mongodb://localhost:27017/market"
app.use(express.urlencoded({ extended: true }));
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MongoDB is allready connected')
});

// view engine setup
app.engine('.hbs', expressHBS({
  defaultLayout: 'layout',
  extname: '.hbs'
}));

app.set('view engine', '.hbs');
app.set('view engine', 'ejs');

app.use(methodOverride());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// static files
app.use(express.static(path.join(__dirname, 'public')));

// app session
app.use(session({
  secret: 'a wonderful secret you will never knew)',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db }),
  cookie: { maxAge: 180 * 60 * 100000 }
}));

// Global variables
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


// Flash messages
app.use(flash());

// include routes
app.use('/', router);
app.use('/dashboard', router);
app.use('/product', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.message2 = err.message2;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;