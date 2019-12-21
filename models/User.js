var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  UserID: {
    type: Number, required: true
  },
  firstName: {
    type: String, required: true
  },
  lastName: {
    type: String, required: true
  },
  email: {
    type: String, required: true
  },
    password: {
      type: String, trim: true
    }
});

userSchema.methods.validPassword = function(password) {
    return password===this.password;
};

var UserModel = mongoose.model('users',userSchema);

module.exports = UserModel;
