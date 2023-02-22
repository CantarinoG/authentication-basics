//Imports 
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('dotenv').config();

//Connecting to db
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
//Check if error on connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

//Creating data schema
const User = mongoose.model(
    "User",
    new Schema({
        username: { type: String, required: true},
        password: { type: String, required: true}
    })
);

//Creating our express app and setting the view engine
//Directory to look and engine used
const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

//This function will be called with passport.authenticate()
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username}, (err, user) => {
            if(err) return done(err);
            if (!user) return done(null, false, { message: "Incorrect username"});
            if (user.password !== password) return done(null, false, {message: "Incorrect password"});
            return done(null, user);
        });
    })
);

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user)
    })
});


app.use(passport.initialize());
app.use(passport.session())
app.use(express.urlencoded({extended: false}));

//current user available to all view beneath it (accessible as res.locals.currentUser)
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
  });

app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );
  app.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.post("/sign-up", (req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    }).save(err => {
        if(err) {
            return next(err);
        }
        res.redirect("/");
    });
});
app.get("/", (req, res) => res.render("index", {
    user: res.locals.currentUser
}));

app.listen(3000, () => console.log("Listening on port 3000."));