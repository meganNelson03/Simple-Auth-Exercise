//jshint esversion:6
var express = require("express"),
    bodyparser = require("body-parser"),
    ejs = require("ejs"),
    mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption"),
    app = express();

var User = require("./models/user.js");

const portNum = 3004;


mongoose.connect("mongodb://localhost:27017/secrets");
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req, res) => {
  User.create({email: req.body.email, password: req.body.password}, (err, newUser) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
})

app.post("/login", (req, res) => {
  User.findOne({email: username}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  })
})


app.listen(portNum, () => {
  console.log(`Listening at ${portNum}...`);
})
