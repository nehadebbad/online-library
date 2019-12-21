var express = require('express');
var router = express.Router();

var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(bodyParser.json());
var crypto = require('crypto');

const { buildSanitizeFunction } = require('express-validator');
const sanitizeBody = buildSanitizeFunction('body');


var connectionDB = require("../utils/connectionDB");
var UserDB = require("../utils/UserDB");

var userModel = require("../models/User");

var userConnection = require("../models/UserConnection");

var userProfileModel = require("../models/UserProfile");

const { check,
  validationResult
} = require('express-validator/check');

router.use(urlencodedParser, async function (req, res, next) {

  if (!req.session.theUser && ((req.query.action === "newConnection") || req.query.action === "login")) {
    var users = await UserDB.getAllUsers();

    var UserProfile = await UserDB.getUserProfile(req.session.theUser.UserID);
    req.session.UserProfile = UserProfile;
  } else if (req.url === "/signIn") {
    res.redirect("/signIn");
  }

  else if (req.session.theUser) {
    if (req.query.action === "newConnection") {
      console.log("In New Connection page");
      res.redirect("/newConnection");
      return;
    }
    else if (req.query.action === "login" || req.query.action === undefined) {
      res.redirect("/login");
      return;
    }

    else if (req.query.action === "save") {
      if (req.session.UserProfile) {
        if (req.body.viewConnections != (JSON.parse(req.query.connection)).connectionId.toString()) {
          res.redirect("/savedConnections");
        }
        else {
          if (req.query.rsvp === "Yes" || req.query.rsvp === "No") {
            var connection = JSON.parse(req.query.connection);
            var connectionItem = {
              connectionId: connection.connectionId,
              connectionName: connection.connectionName,
              connectionTopic: connection.connectionTopic,
              rsvp: req.query.rsvp
            };

            var UserProfile = await UserDB.addRSVP(req.session.theUser.UserID, connectionItem);
            req.session.UserProfile = UserProfile;
            res.redirect("/savedConnections");

          }
          else {
            res.redirect("/savedConnections");
          }
        }
      }
    }

    else if (req.query.action === "delete") {
      if (req.session.UserProfile) {
        var connection = JSON.parse(req.query.connection);
        if (isValidConnectionID(connection.connectionId.toString())) {
          var userProfiles = await UserDB.findUserWithConnection(connection.connectionId);

          if (userProfiles.length > 0)
            var UserProfile = await UserDB.deleteConnectionItem(connection.connectionId, userProfiles);

          await connectionDB.deleteConnectionItem(connection.connectionId);
          res.redirect("/savedConnections");
        }
        else {
          res.redirect("/savedConnections");
        }
      }
    }

    else if (req.query.action === "dersvp") {
      console.log("Im ehre");
      if (req.session.UserProfile) {
        var connection = JSON.parse(req.query.connection);
        if (isValidConnectionID(connection.connectionId.toString())) {
          var userProfiles = await userDB.removeRsvp(connection.connectionId, req.session.theUser.UserID);
          req.session.UserProfile = userProfiles;
          res.redirect("/savedConnections");
        }
        else {
          res.redirect("/savedConnections");
        }
      }
    }

    else if (req.query.action === "update") {
      if (isValidConnectionID((JSON.parse(req.query.connection)).connectionId.toString())) {
        var connection = JSON.parse(req.query.connection);
        connection.rsvp = connection.rsvp == "Yes" ? "No" : "Yes";
        var UserProfile = await UserDB.updateRSVP(connection.connectionId, req.session.theUser.UserID, connection.rsvp);
        req.session.UserProfile = UserProfile;
        res.redirect("/savedConnections");
      }
      else {
        resp.redirect("/savedConnections");
      }

    }
    else if (req.query.action === "updateProfile") {
      if (req.session.UserProfile) {
        if (req.query.rsvp === "Yes" || req.query.rsvp === "No") {
          var connection = JSON.parse(req.query.connection);
          var UserProfile = await UserDB.updateRSVP(connection.connectionId, req.session.theUser.UserID, req.query.rsvp);
          req.session.UserProfile = UserProfile;
          res.redirect("/savedConnections");
        }
        else {
          res.redirect("/savedConnections");
        }
      }
    }

    else if (req.query.action === "logout") {
      if (req.session.theUser) {
      req.session.destroy(function(err) {
        console.log("Session ended :)");
      })
    }
      res.redirect("/");
    }
  }

  next();
});


function isValidConnectionID(connectionId) {
  if (connectionId != "") {
    if (connectionId.length > 0) {
      if (!isNaN(connectionId)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
}

module.exports = router;
