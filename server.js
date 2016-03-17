var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var superSecret = 'ilovescotchscotchyscotch';

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

//Authentication Route
//===========================================
apiRouter.post('/authenticate', function(req, res) {

    //find the user
    //selec the name, username and password explicitly
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user) {
        if(err) throw err;

        //no user with that username was found
        if(!user) {
          res.json({
            success: false,
            message: 'No bueno'
          });
        }
        else if (user) {
          //check if password matches
          var validPassword = user.comparePassword(req.body.password);
          if(!validPassword) {
            res.json({
              success: false,
              message: 'Authentication failed. Password is no bueno'
            });
          }
          else {
            //if user is found and password is right, create a token
            var token = jwt.sign({
                name: user.name,
                username: user.username
            }, superSecret, {
               expiresInMinutes: 1440 //expires in 24 hours
            });

            //return the information including token as JSON
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          }
        }
    });
});

//MIDDLEWARE used for all requests
//===========================================
apiRouter.use(function(req, res, next) {
  //do logging
  console.log('Somebody just came to our app!');

  //check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  //decode token
  if (token) {
    //verify secret and checks exp
    jwt.verify(token, superSecret, function(err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: 'Failed to authenticate token.'
        });
      }
      else {
        //if everything checks out, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    //if there's no token
    //return an HTTP response of 403 (access forbidden) and an error message
    return res.status(403).send({
        success: false,
        message: 'No token provided, broda.'
    });
  }
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

        user.save(function(err) {
            if(err) {
              //duplicate entry
              if(err.code = 11000) {
                return res.json({success: false, message: 'A user with that username already exists'});
              }
              else {
                return res.send(err);
              }

            }
            //successful creation message
            res.json({message: 'User Created!'});
        });
    })

    //get all users
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err) return res.send(err);

            //return the users
            res.json(users);
        });
    });

    //for routes that end in /users/user_id
    apiRouter.route('/users/:user_id')

        //get user with specified id
        .get(function(req, res) {
          User.findById(req.params.user_id, function(err, user) {
              if(err) return res.send(err);

              //else return user
              res.json(user);
          });
        })

        //update user info
        .put(function(req, res) {
            User.findById(req.params.user_id, function(err, user) {
                if (err) return res.send(err);

                //set the new user info if it exists in the request
                if (req.body.name) user.name = req.body.name;
                if (req.body.username) user.username = req.body.username;
                if (req.body.password) user.password = req.body.password;

                //save the updated user info
                user.save(function(err) {
                    if (err) return res.send(err);

                    //successful update message
                    res.json({message: 'User Updated!'});
                });
            });
        })

        //delete specified user
        .delete(function(req, res) {
          console.log("Deleting User: ", req.params.user_id);
            User.remove({
                _id: req.params.user_id
            }, function(err, user) {
                  if(err) return res.send(err);

                  res.json({ message: 'Successfully Deleted!'});
            });
        });
//returns user info (username + iat + exp)
  apiRouter.get('/me', function(req, res) {
    res.send(req.decoded);
  });

//register routes
//=============================================================
//all routes to be prefixed with /api
app.use('/api', apiRouter);

//start the server
app.listen(port);
console.log('Magic is a happenin on port ' + port);
