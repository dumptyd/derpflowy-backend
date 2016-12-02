//jshint node:true
var mongoose = require('mongoose');

var collabSchema = mongoose.Schema({
  list: {
    type: Array,
    default: []
  }
},{timestamps:true});


module.exports = mongoose.model('Collab', collabSchema);