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
app.use(passport.initialize());
app.use(passport.session())
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res) => res.render("index"));

app.listen(3000, () => console.log("Listening on port 3000."));