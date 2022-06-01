
const ObjectId=require('mongodb')//ObjectID 

const DMCollectionName = "DM"

module.exports = function (app, passport, db) {
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get("/", function (req, res) {
    res.render("index.ejs");
  });

  // PROFILE SECTION =========================
  app.get("/parent_profile", isLoggedIn, function (req, res) {
    db.collection(DMCollectionName)
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("parent_profile.ejs", {
          user: req.user,
          messages: result,
        });
      });
  });

  app.get("/teacher_profile", isLoggedIn, function (req, res) {
    db.collection(DMCollectionName)
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("teacher_profile.ejs", {
          user: req.user,
          messages: result,
        });
      });
  });

  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // message board routes ===============================================================

  app.post("/messages", (req, res) => {
    db.collection(DMCollectionName).insertOne(
      { name: req.body.name, msg: req.body.msg, readByCount: 0},
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
        res.redirect("/teacher_profile");
      }
    );
  });

  app.put("/messages", (req, res) => {
    db.collection(DMCollectionName).findOneAndUpdate(
      { name: req.body.name, msg: req.body.msg },
      {
        $set: {
          readByCount: req.body.readByCount + 1,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.delete("/messages", (req, res) => {
    db.collection(DMCollectionName).findOneAndDelete(
      { name: req.body.name, msg: req.body.msg },
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
  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  // process the login form
  app.post(
    "/login",
    (req, res) => {

      const { role } = req.body
      const isTeacher = role === "teacher"

      passport.authenticate("local-login", {
        successRedirect: isTeacher ? "/teacher_profile" : "/parent_profile", // redirect to the secure profile section
        failureRedirect: "/login", // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
      })(req, res)
    }
  );

  // app.post(
  //   "/login",
  //   passport.authenticate("local-login", {
  //     successRedirect: "/teacher_profile", // redirect to the secure profile section
  //     failureRedirect: "/login", // redirect back to the signup page if there is an error
  //     failureFlash: true, // allow flash messages
  //   })
  // );

  // SIGNUP =================================
  // show the signup form
  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile", // redirect to the secure profile section
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
      console.log({ msg: "unlinking local"})
      res.redirect("/profile");
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}
