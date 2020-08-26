//jshint esversion:6
require("dotenv").config();

var express = require("express"),
    bodyparser = require("body-parser"),
    ejs = require("ejs"),
    mongoose = require("mongoose"),
    encrypt = require("mongoose-encryption"),
    bcrypt = require("bcrypt"),
    findOrCreate = require("mongoose-findorcreate");
    app = express();

const GoogleStrategy = require('passport-google-oauth20').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy;

const session = require("express-session"),
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose");

var User = require("./models/user.js");

mongoose.set("useCreateIndex", true);

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser((err, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
})

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3004/google/auth/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_API_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3004/facebook/auth/secrets"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ facebookId: profile.id }, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));


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

app.get("/auth/google", (req, res) => {
  passport.authenticate("google", {scope: ["profile"]});
})

app.get("/auth/facebook", (req, res) => {
  passport.authenticate("facebook");
})

app.get("/auth/google/secrets",
  passport.authenticate("google", {failureRedirect: "/login"}), (req, res) => {
    res.redirect("/secrets");
  });

app.get("/auth/facebook/secrets",
        passport.authenticate("facebook",
        { successRedirect: "/secrets",
          failureRedirect: "/login" }));

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
