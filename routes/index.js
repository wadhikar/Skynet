var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require("../models/user");

/* GET home page. */
router.get('/', function(request, response) {
  response.render('home');
});

/* show register form */
router.get("/register", function(request, response){
  response.render("register");
});
/* handle sign up logic */
router.post("/register", function(request, response){
  var newUser = new User({username: request.body.username});
  User.register(newUser, request.body.password, function(err, user){
    if(err){
      request.flash("error", err.message);
      return response.redirect("/register");
    }
    passport.authenticate("local")(request, response, function(){
      request.flash('message', 'Welcome to Skynet '+ user.username);
      response.redirect("/");
    });
  });
});

/* show login form */
router.get("/login", function(request, response){
  response.render('login');
});
//handling login logic
router.post("/login", passport.authenticate("local",
    {
      successRedirect: "/users",
      failureRedirect: "/login"
    }), function(request, response){
});

// logout route
router.get("/logout", function(request, response){
  request.logout();
  request.flash('message', 'Logged out');
  response.redirect("/");
});

module.exports = router;
