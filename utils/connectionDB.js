var mongoose = require("mongoose");
var connection = require('../models/connection');
var Connection = require('mongoose').model('connections');
var connectionDB = {};

connectionDB.getConnections = function () {
    return new Promise((resolve, reject) =>{
        connection.find({}).then(function(connection) {
            resolve(connection);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

connectionDB.getConnection = function (connectionID) {
    return new Promise((resolve, reject) =>{
        connection.findOne({connectionId: connectionID}).then(function(connections) {
          console.log("Connection: "+connections);
            resolve(connections);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

connectionDB.addNewConnection = function(connection){
  return new Promise((resolve, reject) =>{
    connectionDB.getConnections().then(function(connections){
      connection.connectionId = connections.length + 1;
      var newConnection = new Connection(connection);
      newConnection.save().then(function(data) {
        console.log(data);
        resolve(data);
      }).catch(function(err) {
          console.log("Error:", err);
          return reject(err);
      });
    });
  });
}

connectionDB.deleteConnectionItem = function (connId) {
    return connection.remove({'connectionId': connId});
};

connectionDB.updateConnection = function(conn) {
  return Connection.update({connectionId: conn.connectionId}, conn);
}

module.exports = connectionDB;
