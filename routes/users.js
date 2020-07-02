var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Lecture = require('../models/lecture');
var Drawing = require('../models/drawing');
var Group = require('../models/group');
var authenticate = require('../middleware/authenticate');

/* GET users listing. */
router.get('/', function(request, response) {
  User.find({}, function (error, list) {
    if (error){
      request.flash('error', "Error searching for users");
      response.redirect('/');
    } else {
      response.render('users/index', {users: list});
    }
  });
});

/* GET a user's public profile */
router.get('/:id', authenticate.isLoggedIn, function (request, response) {
  Lecture.find({'author': request.params.id }, function (error, list) {
    if (error){
      request.flash('error', "Error searching for the user's lectures");
      response.redirect('/');
    } else {
      User.findById( request.params.id, function (error, user) {
        if(error){
          request.flash('error', "Error looking up the user");
          response.redirect('/');
        } else {
          response.render('users/show', {lectures: list, user: user});
        }
      });
    }
  });
});
/* EDIT: GET the edit page */
router.get("/:id/edit", authenticate.userOwnership, function(request, response){
  User.findById(request.params.id, function (error, foundUser) {
    if(error){
      request.flash('error', 'could not find the user');
      response.redirect("/users/" + request.params.id);
    }
    response.render('users/edit', {user : foundUser});
  });
});
/* UPDATE: PUT the edit page */
/* @TODO only checks is the user is logged in, does not check ownership of the account */
router.put('/:id', authenticate.userOwnership, function (request, response) {
  User.findById(request.params.id, function (error, foundUser) {
    if(error){
      request.flash('error', 'something went wrong');
      response.redirect("/users/" + request.params.id);
    } else {
      console.log(request.body);
      foundUser.username = request.body.username;
      foundUser.save();
      response.redirect("/users" );
    }
  });
});
// /* DESTROY: DELETE a user*/
// /* @TODO only checks is the user is logged in, does not check ownership of the account */
router.delete("/:id", authenticate.userOwnership, function (request, response) {
  /* first destroy all lectures authored by the user */
  Lecture.find({'author': request.params.id }, function (error, lectures) {
    if (error){
      request.flash('error', "Error searching for the user's lectures");
      response.redirect('/');
    } else {
      lectures.forEach(function(lecture){
        Lecture.findByIdAndDelete(lecture._id, function (error) {
          if (error) {
            console.log('could not delete all lectures');
            request.flash('error', 'could not delete all lectures of the user');
            response.redirect("/users/" + request.params.id);
          }
        });
      });
    }
  });
  /* second destroy all drawings authored by the user */
  Drawing.find({'author': request.params.id }, function (error, drawings) {
    if (error){
      request.flash('error', "Error searching for the user's drawings");
      response.redirect('/');
    } else {
      drawings.forEach(function(drawing){
        Drawing.findByIdAndDelete(drawing._id, function (error) {
          if (error) {
            console.log('could not delete all drawings');
            request.flash('error', 'could not delete all drawings of the user');
            response.redirect("/users/" + request.params.id);
          }
        });
      });
    }
  });
  /* third destroy all groups owned by the user */
  Group.find({'owner': request.params.id }, function (error, groups) {
    if (error){
      request.flash('error', "Error searching for the user's groups");
      response.redirect('/');
    } else {
      groups.forEach(function(group){
        Group.findByIdAndDelete(group._id, function (error) {
          if (error) {
            console.log('could not delete all groups');
            request.flash('error', 'could not delete all groups of the user');
            response.redirect("/users/" + request.params.id);
          }
        });
      });
    }
  });

    /* then delete the user */
  User.findByIdAndDelete(request.params.id, function (error) {
      if (error) {
        request.flash('error', 'could not delete the user');
        response.redirect("/users");
      } else {
        response.redirect("/users");
      }
    });
});


module.exports = router;
