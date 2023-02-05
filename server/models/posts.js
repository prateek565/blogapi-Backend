const mongoose = require('mongoose');

// Blog post schema
const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdBy:String,
  cratedOn:String
});

module.exports = mongoose.model('Post', postSchema);