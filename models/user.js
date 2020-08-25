var mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption");

var userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

var User = mongoose.model("User", userSchema);

module.exports = User;
