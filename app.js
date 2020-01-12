const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressHBS = require('express-handlebars');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const router = require('./routes/index');
const users = require('./routes/users');

const app = express();

app.use(express.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/market', { useUnifiedTopology: true, useNewUrlParser: true });

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);
app.use('/dashboard', router);
app.use('/product', router);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;