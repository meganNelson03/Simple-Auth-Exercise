var mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption");

const session = require("express-session"),
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// hash & salt user pwd, seed our mongodb for us
userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

module.exports = User;
