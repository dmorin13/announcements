const mongoose = require("mongoose");


module.exports = function (app, passport, db) {
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get("/", function (req, res) {
    res.render("home.ejs");
  });

  // PROFILE SECTION =========================
  //  if ( user.local.role === teacher ) {
    // If teacher logs in  -- problem: don't know how to test with multiple users
    app.get("/teacher_profile", isLoggedIn, function (req, res) {
      db.collection("messages")
        .find()
        .toArray((err, messages) => {
          if (err) return console.log(err);
          
          res.render("teacher_profile.ejs", {
            "user": req.user,
            "messages": messages,
            // "role": user.local.role 
          });
        });
    });
    
  //  } else { 
  app.get("/parent_profile", isLoggedIn, function (req, res) {
    db.collection("messages")
      .find()
      .toArray((err, messages) => {
        if (err) return console.log(err);

        res.render("parent_profile.ejs", {
          "user": req.user,
          "messages": messages,
          // "role": user.local.role 
        });
      });
  });

  
  // app.get("/profile", isLoggedIn, function (req, res) {
  //   db.collection("messages")
  //     .find()
  //     .toArray((err, messages) => {
  //       if (err) return console.log(err);



  //       res.render("profile.ejs", {
  //         "user": req.user,
  //         "messages": messages,
  //       });
  //     });
  // });
  

  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // message board routes ===============================================================

 //new get?

  app.post("/parent_messages", (req, res) => {
    db.collection("parent_messages").save(
      {
        // name: req.body.email,
        name: req.body.name,
        role: req.body.role,
        msg: req.body.msg,
        read: false
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        res.redirect("/profile_parent");
      }
    );
  });
  app.post("/teacher_messages", (req, res) => {
    console.log({ msg: "post to /teacher_messages", user: req.user})
    db.collection("messages").save(
      {
        name: req.body.name,
        role: req.body.role,
        msg: req.body.msg,
        read: false
      },
      (err, result) => {
        if (err) return console.log(err);

        console.log("saved to database");
        res.redirect("/teacher_profile");
      }
    );
  });

  app.put("/messages", (req, res) => {
    db.collection("messages").findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.body.id) },
      {
        $set: {
          read: req.body.isRead,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false, 
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.delete("/messages", (req, res) => {
    db.collection("messages").findOneAndDelete(
      { _id: new mongoose.Types.ObjectId(req.body.id) },
      (err, result) => {
        if (err) return res.send(500, err);
        res.send("Message deleted!");
      }
    );
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get("/login_parent", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });
  app.get("/login_teacher", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.post(
    "/login_parent",
    passport.authenticate("local-login", {
      successRedirect: "/parent_profile", //redirect to the secure profile section
      failureRedirect: "/login_parent", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  app.post(
    "/login_teacher",
    passport.authenticate("local-login", {
      successRedirect: "/teacher_profile", //redirect to the secure profile section
      failureRedirect: "/login_teacher", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );


  //  process the login form
  //  app.post("/login", function (req, res) {
  //    db.collection("messages").save(
  //      {
  //        role: req.body.role,
  //      },
  //      (err, result) => {
  //      if (err) return console.log(err);
  //      console.log("saved role to database")
  //      if(role === teacher ) {
  //      passport.authenticate("local-login", {
  //      successRedirect: "/teacher_profile", // redirect to the secure profile section
  //      failureRedirect: "/login", // redirect back to the signup page if there is an error
  //      failureFlash: true, // allow flash messages
  //      } else {
  //        passport.authenticate("local-login", {
  //        successRedirect: "/parent_profile", // redirect to the secure profile section
  //        failureRedirect: "/login", // redirect back to the signup page if there is an error
  //        failureFlash: true, // allow flash messages
  //      })
  //    })
  //  }
  //   })
  //  })



      

  // SIGNUP =================================
  // show the signup form
  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get("/unlink/local", isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect("/profile");
    });
  });
};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}
