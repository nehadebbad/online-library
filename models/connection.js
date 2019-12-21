var mongoose = require('mongoose');

var connectionSchema = new mongoose.Schema({
  connectionId:{
    type: Number, required: true
  },
  userId:{
    type: Number, required:  true
  },
  connectionName:{
    type: String, required: true
  },
  connectionTopic:{
    type: String, required: true
  },
  connectionDetails:{
    type: String, required: true
  },
  connectionTime:{
    type: String, rrequired: true
  }
});

var connectionModel = mongoose.model('connections',connectionSchema);

module.exports = connectionModel;
