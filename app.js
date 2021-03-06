var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goodRouter = require('./routes/goods');
var commentRouter = require('./routes/comments');
var shoppingCartRouter = require('./routes/shoppingCarts')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/demo',express.static(path.join(__dirname, 'demo')));//web端
// app.use('/manage',express.static(path.join(__dirname, 'manage')));//后台管理端

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goodRouter);
app.use('/comments', commentRouter);
app.use('/shoppingCarts', shoppingCartRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
//   if (req.method == 'OPTIONS') {
//     res.send(200);
//   } else {
//     next();
//   }
// });

module.exports = app;
