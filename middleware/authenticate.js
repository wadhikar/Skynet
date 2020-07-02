var Lecture = require("../models/lecture");
var Group = require("../models/group");
var User = require("../models/user");

var authenticate = {};

/* Basic Authentication for creating lectures and groups, or opening the user profile */
authenticate.isLoggedIn = function(request, response, next){
    if(request.isAuthenticated()){
        return next();
    }
    request.flash('error', "First log in");
    response.redirect("/login");
};

authenticate.lectureOwnership = function(request, response, next) {
    if(!request.isAuthenticated()){
        request.flash('error', "First log in");
        response.redirect("/login");
    } else {
        Lecture.findById(request.params.id).exec(function (error, foundLecture){
            if(error){
                request.flash('error', 'could not find the lecture');
                response.redirect('/lectures');
            } else if (!foundLecture.author.equals(request.user._id)) {
                request.flash("error", "You are not the author of the lecture");
                response.redirect("back");
            } else {
                next();
            }
        });
    }
};
authenticate.userOwnership = function(request, response, next){
    if(!request.isAuthenticated()){
        request.flash('error', "First log in");
        response.redirect("/login");
    } else {
        User.findById(request.params.id).exec(function (error, foundUser){
            if(error){
                request.flash('error', 'could not find the user');
                response.redirect('/users');
            } else if (!foundUser._id.equals(request.user._id)) {
                request.flash("error", "You are not the owner of the account");
                response.redirect("back");
            } else {
                next();
            }
        });
    }
};

authenticate.groupOwnership = function(request, response, next) {
    if(!request.isAuthenticated()){
        request.flash('error', "First log in");
        response.redirect("/login");
    } else {
        Group.findById(request.params.id).exec(function (error, foundGroup){
            if(error){
                request.flash('error', 'could not find the group');
                response.redirect('/groups');
            } else if (!foundGroup.owner.equals(request.user._id)) {
                request.flash("error", "You don't own the group");
                response.redirect("back");
            } else {
                next();
            }
        });
    }
};
authenticate.groupMembership = function(request, response, next) {
    if (!request.isAuthenticated()) {
        request.flash('error', "First log in");
        response.redirect("/login");
    } else {
        Group.findById(request.params.id).exec(function (error, foundGroup) {
            if (error) {
                request.flash('error', 'could not find the group');
                response.redirect('/groups');
            } else {
                let isMember = false;
                console.log(request.user._id);
                foundGroup.members.forEach(function (member) {
                    console.log(member._id);
                    if (request.user._id === member._id) {
                        isMember = true;
                    }
                });
                if (!isMember) {
                    request.flash("error", "You don't own the group");
                    response.redirect("back");
                } else {
                    next();
                }
            }
        });
    }
};
module.exports = authenticate;
