// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9080;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  console.log('Assigning Routes...')
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2022a', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const MongoClient = require("mongodb").MongoClient;
// const mongoose = require('mongoose');
// var port     = process.env.PORT || 9080;

// //global
// var db, collection;
// const url ='mongodb+srv://dmorin2022:FbrtGZrcBsAONTYm@cluster0.0uhxs.mongodb.net/?retryWrites=true&w=majority'
// // const dbName = "demo";
// const dbName = "messages";
// //higher order function
// // app.listen(9090, () => {
// //   MongoClient.connect(
// //     url,
// //     { useNewUrlParser: true, useUnifiedTopology: true },
// //     (error, client) => {
// //       if (error) {
// //         throw error;
// //       }
// //       db = client.db(dbName);
// //       console.log("Connected to `" + dbName + "`!");
// //     }
// //   );
// // });
// mongoose.set('useNewUrlParser', true)//gets rid of deprecation error 
// mongoose.set('useUnifiedTopology', true)


// mongoose.connect(configDB.url, (err, database) => {
//    if (err) return console.log(err)
//    db = database
//    require('./app/routes.js')(app, passport, db);
//  }); // connect to our database


// app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// //client side static files are accessible/ public?
// app.use(express.static("public"));

// app.get("/", (req, res) => {
//   db.collection("DM")
//     .find()
//     .toArray((err, msg) => {
//       if (err) return console.log(err);
//       res.render("index.ejs", { text: msg });
//     });
// });

// app.post("/send", (req, res) => {
//   db.collection("DM").insertOne(
//     {text: req.body.msg},
//     (err, result) => {
//       if (err) return console.log(err);
//       console.log("saved to database");
//       res.redirect("/");
//     }
//   );
// });

// app.put("/send", (req, res) => {
//   db.collection("DM").findOneAndUpdate(
//     {text: req.body.msg},
//     {
//       $set: {
//         post: req.body.msg
//       }
//     },

//     (err, result) => {
//       if (err) return res.send(err);
//       res.send(result);
//     }
    
//   );
// });
// app.put("/sendMessage", (req, res) => {
//   db.collection("DM").findOneAndUpdate(
//     {text: req.body.msg },

//     (err, result) => {
//       if (err) return res.send(err);
//       res.send(result);
//     }
    
//   );
// });


// app.delete("/send", (req, res) => {
//   db.collection("messages").findOneAndDelete(
//     {text: req.body.msg },
//     (err, result) => {
//       if (err) return res.send(500, err);
//       res.send("Message deleted!");
//     }
//   );
// });

// // // launch ======================================================================
// // app.listen(port);
// // console.log('The magic happens on port ' + port);
