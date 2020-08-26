var mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption");

const session = require("express-session"),
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose"),
      findOrCreate = require("mongoose-findorcreate");;

var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});
// hash & salt user pwd, seed our mongodb for us
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

var User = mongoose.model("User", userSchema);

module.exports = User;
