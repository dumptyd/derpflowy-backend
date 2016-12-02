//jshint node:true
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var defaultList = require('../data/initialList');

var userSchema = mongoose.Schema({
  local: {
    username: String,
    password: String,
  },
  list: {
    type: Array,
    default: defaultList
  }
},{timestamps:true});

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);