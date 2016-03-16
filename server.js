var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080
var User = require('./app/models/user');

//App Configuration
//body parser allows access to POST request content
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configures app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', 'GET, POST');
  res.setHeader('Access-Control-Allow-Origin', 'X-Requested-With, content-type, Authorization');

  next();
});

//log all requests to the console
app.use(morgan('dev'));

//connect to database
mongoose.connect('mongodb://testUser:testPass@ds015889.mlab.com:15889/testin_some_stuff')


//Routes For API

//basic route for home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});

//get an instance of the express router
var apiRouter = express.Router();

//MIDDLEWARE used for all requests
//===========================================
apiRouter.use(function(req, res, next) {
  //do logging
  console.log('Somebody just came to our app!');
  next();
});

//test route to make sure all is working properly
apiRouter.get('/', function(req, res) {
  res.json({message: 'hooray! welcome to our api!'});
});

//more routes here
//=============================================================

apiRouter.route('/users')

    //create a user
    .post(function(req, res) {
      var user = new User();
      user.name = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;
    })

//register routes
//=============================================================
//all routes to be prefixed with /api
app.use('/api', apiRouter);

//start the server
app.listen(port);
console.log('Magic is a happenin on port ' + port);
