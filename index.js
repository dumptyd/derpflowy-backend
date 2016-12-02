require('dotenv').config({silent:true});
const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  passport = require('passport'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  path = require('path'),
  User = require('./models/user'),
  Collab = require('./models/collab');
  let io = require('socket.io');
// configuration ===============================================================
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});
var db = mongoose.connection;
require('./config/passport')(passport);
app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname , 'public')));
//-------------------------routes------------------------------//
const signin = require('./routes/signin')(passport),
  signup = require('./routes/signup')(passport),
  updateData = require('./routes/updateData')(isLoggedIn, User),
  getData = require('./routes/getData')(isLoggedIn, User),
  createCollab = require('./routes/createCollab')(isLoggedIn, Collab),
  
  signout = require('./routes/signout')();
//----------------------------routes----------------------------//
app.get('/', function (req, res) {
  if (req.isAuthenticated()) res.redirect('/profile');
  else res.render('index');
});
app.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile');
});
//---------------//
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/updateData', updateData);
app.use('/getData', getData);
app.use('/createCollab', createCollab);

app.use('/signout', isLoggedIn, signout);
// app.use(function(req,res){
//     res.redirect('/');
// });
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){return next();}
  res.redirect('/');
}


//--------------------------------------------------------------//
db.once('open', function (err) {
  let server = app.listen(port);
  io = io(server);
  console.log('Running on ' + port);
  //--------------socket config --------------------//
  let nsp = io.of('/collab');
  let collab = require('./routes/collab')(Collab,nsp);
  app.use('/collab', collab);
  nsp.on('connection', function(socket){
    console.log('Someone connected');
    
    socket.on('join room', function(obj){
      socket.join(obj.roomId);
      console.log('Joined: '+ obj.roomId);
    });
    
    socket.on('disconnect', function(){
      console.log('Someone disconnected');
    });
  });
});