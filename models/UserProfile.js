var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
};

var UserProfileListSchema = new mongoose.Schema({
  connectionId:{
    type: Number, required: true
  },
  connectionName:{
    type: String, required: true
  },
  connectionTopic:{
    type: String, required: true
  },
  rsvp:{
    type: String, required: true
  }
});

var UserProfileSchema = new mongoose.Schema({
  UserID:{
    type: Number, required: true
  },
  UserProfileList: [UserProfileListSchema]

});


module.exports = mongoose.model("user_profiles",UserProfileSchema);
