var mongoose = require("mongoose");
var User = require('../models/User');
var UserProfile = require('../models/UserProfile');
var connectionDB = require('../utils/connectionDB');


userDB = {};

userDB.createNewUser = function(userObj){
    return new Promise((resolve, reject)=>{
        userObj.save().then(function(user){
            var userProfile = new UserProfile({UserID:user.UserID,UserProfileList:[]});
            userProfile.save().then(function(userProfile){
                resolve(userProfile);
            }).catch(function(err){
                console.log("Error:", err);
                return reject(err);
            })
        }).catch(function(err){
            console.log("Error:", err);
            return reject(err);
        });
    });
};

userDB.getAllUsers = function () {
    return new Promise((resolve, reject) =>{

        User.find({}).then(function(users) {
          console.log("USERD" +users);
            resolve(users);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUser =  function (userId) {
    return new Promise((resolve, reject) =>{
        User.findOne({UserID: userId}).then(function(user) {
          console.log(user);
            resolve(user);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUserByEmail =  function (email) {
    return new Promise((resolve, reject) =>{
        User.findOne({email: email}).then(function(user) {
          console.log(user);
            resolve(user);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUserProfile = function (userId) {
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.addRSVP = function(userId,userConnection){
    return new Promise((resolve, reject) =>{
        var count = 0;
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(userConnection.connectionId==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList[index].rsvp = userConnection.rsvp;
                    count++;
                }
            }
            if(count==0){
                userProfile.UserProfileList.push(userConnection);
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    });
};

userDB.updateRSVP = function (connectionID, userId, rsvp){
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(connectionID==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList[index].rsvp = rsvp;
                }
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.findUserWithConnection = function(connectionId) {
  return new Promise((resolve, reject) =>{
      UserProfile.find({'UserProfileList.connectionId': connectionId}).then(function(userProfiles) {
          resolve(userProfiles);
      }).catch(function(err) {
          console.log("Error:", err);
          return reject(err);
      });
  })
};

userDB.deleteConnectionItem = function(connectionId, userProfiles){

  return new Promise((resolve, reject) =>{
    for (index = 0; index < userProfiles.length; index++) {
      UserProfile.findOne({UserID: userProfiles[index].UserID}).then(function(userProfile) {
          for (let index = 0; index < userProfile.UserProfileList.length; index++) {
              if(connectionId==userProfile.UserProfileList[index].connectionId){
                  userProfile.UserProfileList.splice(index, 1);
              }
          }
          userProfile.save();
          resolve(userProfile);
      }).catch(function(err) {
          console.log("Error:", err);
          return reject(err);
      });
    }

    

  })

};

userDB.removeRsvp =  function(connectionId, userId) {
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(connectionId==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList.splice(index, 1);
                }
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
}

module.exports = userDB;
