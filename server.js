var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080

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

//Routes For API

//basic route for home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!');
});

//get an instance of the express router
var apiRouter = express.Router();

//test route to make sure all is working properly
apiRouter.get('/', function(req, res) {
  res.json({message: 'hooray! welcome to our api!'});
});

//more routes here
//=============================================================


//register routes
//all routes to be prefixed with /api
app.use('/api', apiRouter);

//start the server
app.listen(port);
console.log('Magic is a happenin on port ' + port);
