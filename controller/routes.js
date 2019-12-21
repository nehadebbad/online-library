var express = require('express');
var router = express.Router();
var connDB = require("../utils/connectionDB.js");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var UserDB = require("../utils/UserDB");
var User = require("../models/User");

const { check, param, validationResult } = require('express-validator/check')

router.all('/', function (req, res) {
  res.render('index');
});

router.all('/index', function (req, res) {
  res.render('index');
});


router.get('/contact', function (req, res) {
  res.render('contact');
});

router.get('/about', function (req, res) {
  res.render('about');
});

router.get("/connection", async function (req, res) {
  console.log("In connection get!");
  if (Object.keys(req.query).length > 0) {
    if (req.query.connectionId.length == 1) {
      if (!isNaN(req.query.connectionId)) {
        var connection = await connDB.getConnection(req.query.connectionId);
        console.log("test conn", connection);
        res.render("connection", { connection: connection, action: "" });
      }
      else {
        res.redirect("/connections");
      }
    }
    else {
      res.redirect("/connections");
    }
  }
  else {
    res.redirect("/connections");
  }
});

router.post("/connection", urlencodedParser, async function (req, res) {
  if (Object.keys(req.query).length > 0) {
    if (req.query.action === "update") {
      if (req.query.connectionId != "") {
        if (req.query.connectionId.length >= 1) {
          if (!isNaN(req.query.connectionId)) {
            var connection = await connDB.getConnection(req.query.connectionId);
            res.render("connection", { connection: connection, action: "update" });
          }
        }
      }
      else {
        res.redirect("/connections");
      }
    }
    else {
      res.redirect("/connections");
    }
  }
  else {
    res.redirect("/connections");
  }
});

router.get("/connections", async function (req, res) {
  if (req.session.theUser && req.session.UserProfile) {
    var connections = await connDB.getConnections();
    var catTopic = [];
    var owner = [];
    for (i = 0; i < connections.length; i++) {
      if (catTopic.indexOf(connections[i].connectionTopic) === -1) {
        catTopic.push(connections[i].connectionTopic);
      }
      // console.log("id1", connections[i].userId);
      // console.log("id2", req.session.theUser.UserID);
      if (connections[i].userId === req.session.theUser.UserID) {
        console.log("Owner found!");
        owner.push(1);
      } else {
        owner.push(0);
      }
    }

    console.log("connections!", connections);
    console.log("owner", owner);
    res.render("connections", { connections: connections, categories: catTopic, owner: owner });
  }
  else {
    res.redirect("/");
  }

});

router.get("/savedConnections", function (req, res) {
  res.render("savedConnections", { "savedConnection": ((req.session.UserProfile) ? req.session.UserProfile.UserProfileList : []) });
});

router.get("/newConnection", function (req, res) {
  if (!req.session.theUser) {
    res.redirect("/signIn");
  } else {
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    var data = {
      title: 'New Connection',
      path: req.url,
      errorMessage: errorMessage
    };
    res.render("newConnection", { data: data });
  }
});

router.get("/updateConnection", async function (req, res) {
  if (!req.session.theUser) {
    res.redirect("/signIn");
  } else {
    if (req.query.connectionId.length == 1) {
      if (!isNaN(req.query.connectionId)) {
        var connection = await connDB.getConnection(req.query.connectionId);
        var errorMessage = req.session.errorMessage;
        req.session.errorMessage = null;
        var data = {
          title: 'Update Connection',
          path: req.url,
          errorMessage: errorMessage
        };
        res.render("updateConnection", { data: data, connection: connection });
      }
      else {
        res.redirect("/connections");
      }
    }


  }
});

router.post('/newConnection', [
  check('name').isLength({ min: 5 }).withMessage('enter name correctly'),
  check('topic').isLength({ min: 3 }).withMessage('enter topic correctly'),
  check('details').isLength({ min: 1 }).withMessage('enter details correctly'),
  check('date').isLength({ min: 1 }).withMessage('enter time correctly')
], async function (req, res) {
  const errors = validationResult(req);
  console.log("errors", errors);
  if (errors.array().length > 0) {
    req.session.errorMessage = errors.array();
    res.redirect("newConnection");
}else{
    var connection = {
      connectionName: req.body.name,
      connectionTopic: req.body.topic,
      connectionTime: req.body.date,
      connectionDetails: req.body.details,
      userId: req.session.theUser.UserID
    };

    console.log("new conn", connection);
    var newConnection = await connDB.addNewConnection(connection);
    res.redirect("/connections");
  }
});

router.post('/updateConnection', [
  check('name').isLength({ min: 5 }).withMessage('enter name correctly'),
  check('topic').isLength({ min: 3 }).withMessage('enter name correctly'),
  check('details').isLength({ min: 1 }).withMessage('enter name correctly'),
  check('date').isLength({ min: 1 }).withMessage('enter name correctly')
], async function (req, res) {
  const errors = validationResult(req);
  console.log("errors", errors);
  if (errors.array().length > 0) {
    req.session.errorMessage = errors.array();
    res.redirect("newConnection");
}else{
    var connection = {
      connectionName: req.body.name,
      connectionTopic: req.body.topic,
      connectionTime: req.body.date,
      connectionDetails: req.body.details,
      userId: req.session.theUser.UserID,
      connectionId: parseInt(req.body.connectionId)
    };

    console.log("update conn", connection);
    await connDB.updateConnection(connection);
    res.redirect("/connections");
  }
});


router.get('/registration_page', function(req,res){
  var errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    if (req.session.theUser) {
        console.log('already logged in user');
        res.redirect('/');
    }else{
      var data = {
          title: 'Register',
          path: req.url,
          errorMessage: errorMessage
      };
      res.render('register', {
          data: data
      });
  }
});

router.post('/register',[
  check('email').isEmail().normalizeEmail().withMessage('email not correct'),
  check('password').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Password not correct'),
  check('firstName').isLength({min : 3}).withMessage('FirstName must have min 3 characters'),
  check('firstName').isAlpha().withMessage('FirstName must have only letters and no spaces'),
  check('lastName').isLength(({min : 3})).withMessage('LastName must have min 3 characters'),
  check('lastName').isAlpha().withMessage('LastName must have only letters and no spaces'),
  check('confirmPassword').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Confirm Password wrongly entered'),
  check('confirmPassword', 'Password Confirmation field should contain same value as the password field').exists().custom((value, { req }) => value === req.body.password),
  check('email', 'Email Id already exists. Try to remember the password').exists().custom( async (value, { req }) => {
      var user = await UserDB.getUserByEmail(value);
      if(user===null)
          return true;
      else
          return false;
  }),
] , async function(req,res){
  const errors = validationResult(req);
  if (errors.array().length>0){
    req.session.errorMessage = errors.array();
    res.redirect('/registration_page');
  }else{
    if (req.session.theUser) {
      console.log('User already logged in');
      res.redirect('/');
  }else{
    var users = await UserDB.getAllUsers();
    console.log("users", users);
    var userId = users.length != 0 ? users[users.length-1].UserID : 0;
    var userObject = {
      UserID: userId+1,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
  };
  var userModelObject = new User(userObject);

  var user = await userDB.createNewUser(userModelObject);
  if(user != null){
    req.session.theUser = user;
    req.session.UserProfile = await userDB.getUserProfile(user.UserID);
    res.redirect('/savedConnections');
  }
  }
  }
});

router.get('/signIn', function (req, res) {
  var errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;
  if (req.session.theUser) {
    console.log('User already logged in');
    res.redirect('/');
  } else {
    var data = {
      title: 'Sign In',
      path: req.url,
      errorMessage: errorMessage
    };
    res.render('login', { data: data });
  }
});

router.post("/login", urlencodedParser, [
  check('username').isEmail().normalizeEmail().withMessage('Username not correct'),
  check('password').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Please enter the password correctly')
], async function (req, res) {
  if (req.session.theUser) {
    console.log('User already logged in');
    res.redirect('/');
  } else {
    var username = req.body.username;
    var password = req.body.password;
    var user = await UserDB.getUserByEmail(username);
    if (user != null && user.validPassword(password)) {

      req.session.theUser = user;
      console.log("hola", req.session.theUser);
      req.session.UserProfile = await UserDB.getUserProfile(user.UserID);
      console.log('session userprofile ', req.session.UserProfile);
      res.redirect('/savedConnections');
    } else {

      var errorMessage = "Either username or password is incorrect";
      req.session.errorMessage = errorMessage;
      res.redirect('/signIn');
    }
  }
});

module.exports = router;
