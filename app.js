//jshint esversion:6
require("dotenv").config();

var express = require("express"),
    bodyparser = require("body-parser"),
    ejs = require("ejs"),
    mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption"),
    bcrypt = require("bcrypt"),
    app = express();

const session = require("express-session"),
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose");

var User = require("./models/user.js");

mongoose.set("useCreateIndex", true);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const saltRounds = 10;
const portNum = 3004;

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secrets");


app.get("/", (req, res) => {
  res.render("home");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

app.post("/register", (req, res) => {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
})

app.post("/login", (req, res) => {

    const user = {
      username: req.body.username,
      password: req.body.password
    }

    req.login(user, (error) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        })
        res.redirect("/login");
      }
    })

})


app.listen(portNum, () => {
  console.log(`Listening at ${portNum}...`);
})
