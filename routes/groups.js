var express = require('express');
var mongoose = require('mongoose');
var Group = require('../models/group');
var User = require('../models/user');
var authenticate = require('../middleware/authenticate');
var router = express.Router();


/* INDEX:  GET Group listing. */
router.get('/', authenticate.isLoggedIn, function(request, response) {
    // find the list of all Groups
    Group.find({$or: [{owner: request.user._id}, {members: {$in: request.user._id}}]})
        .then(function (list) {
            response.render('groups/index', {groups: list});
        }).catch(function (error) {
        request.flash('error', "Could not find the Group");
        response.redirect('/groups');
    });
});

/* NEW: GET group form */
router.get("/new", authenticate.isLoggedIn, function(request, response){
        response.render('groups/new');
});

/* SHOW: GET a group */
router.get("/:id", function (request, response) {
    Group.findById(request.params.id)
        .exec()
        .then(function (foundGroup) {
            var listMembers = foundGroup.members;
            User.find({_id: listMembers})
                .exec()
                .then(function (result) {
                    return Promise.all(result)
                        .then(function (found) {
                            return response.render('groups/show', {group: foundGroup, members: found});
                        })
                        .catch(function (error) {
                            request.flash('error', "Could not find the Group");
                            response.redirect('/groups/:id');
                        });
                });
        })
        .catch(function (error) {
            request.flash('error', "Could not find the Group");
            response.redirect('/groups/:id');
        });
});
router.get('/:id/live', authenticate.isLoggedIn, function (request, response) {
    Group.findById(request.params.id).exec(function (error, foundGroup){
        if(error){
            request.flash('error', 'could not find the group');
            response.redirect('/groups');
        } else {
            // passed the group just in case needed
            response.render('groups/live', {group : foundGroup});
        }
    })
});


/*EDIT group*/
/* INDEX:  GET Group listing. */
router.get('/:id/edit',function(request, response) {
    Group.findById(request.params.id)
        .exec()
        .then(function (foundGroup) {
            var listMembers = foundGroup.members;
            User.find({_id: listMembers})
                .exec()
                .then(function (result) {
                    return Promise.all(result)
                        .then(function (found) {
                            return response.render('groups/edit', {group: foundGroup, members:found});
                        })
                        .catch(function (error) {
                            request.flash('error', "Could not find the Group");
                            response.redirect('/groups'
                            );
                        });
                });
        })
        .catch(function (error) {
            request.flash('error', "Could not find the Group");
            response.redirect('/groups'
            );
        });
});

// UPDATE: PUT the edit page
router.put('/:id', function (request, response) {
    var memberList = request.body.member;
    var list = [];
    Group.findById(request.params.id)
        .then(function (foundLecture) {

            /* this update is not safe but works for now
            *  @TODO can be improved by using findByIdAndUpdate, or Buffer.alloc() */
            User.find({username: memberList})
                .exec()
                .then(function (result) {
                    return Promise.all(result)
                        .then(function findNewID(user) {
                            list = user.map(user => mongoose.Types.ObjectId(user._id.toString()));
                            return list;
                        });
                })
                .catch(function (error) {
                    request.flash('error', "Could not find the users");
                    //redirect back to index
                    response.redirect('/groups/' + foundLecture._id);
                })
                .then(function updateGroup(list) {
                    return Promise.all(list)
                        .then(function (member) {
                            foundGroupMembers =foundLecture.members;
                            foundGroupMembers.push(member);
                            var unique = Array.from(new Set(foundGroupMembers));
                            foundGroupMembers = unique;
                            foundLecture.name = request.body.groupName;
                            console.log(foundGroupMembers);
                            foundLecture.save();
                        });
                })
                .then(function(){
                    response.redirect("/groups/" + foundLecture._id);
                })
                .catch(function (error) {
                    request.flash('error', "Could not update group");
                    //redirect back to index
                    response.redirect('/groups/' + foundLecture._id + '/edit');
                });
        });
});

//REMOVE: Remove a member
router.delete('/:groupID/delete/:id', function(request, response) {
    var groupID = request.params.groupID;
    var userID = request.params.id;
    Group.find({_id:groupID})
        .then(function(result){
            groupMembers = result[0].members;
            var userObjectID = mongoose.Types.ObjectId(userID);
            var index = groupMembers.indexOf(userObjectID);
            groupMembers.splice(index, 1);
            result[0].members = groupMembers;
            result[0].save();
        })
        .then(function () {
            response.redirect('/groups/'+request.params.groupID+'/edit');
        });
});


/* CREATE: POST Group form that creates a new Group */
router.post('/new', authenticate.isLoggedIn, function(request,response) {
    var name = request.body.groupName;
    var owner = request.user._id;
    var memberList= request.body.member;
    var list = [];

    User.find({username: memberList})
        .exec()
        .then(function(result) {
            return Promise.all(result)
                .then(function addId(user) {
                    list = user.map(user => mongoose.Types.ObjectId(user._id.toString()));
                    return list;
                })
        })
        .then(function fillSchema(list) {
            list.push(mongoose.Types.ObjectId(owner));
            return {
                _id: mongoose.Types.ObjectId(),
                name: name,
                owner: owner,
                members: list
            };
        })
        .then(function createGroup(newGroup){
            //Create group
            Group.create(newGroup, function(error){
                if(error){
                    throw error;
                }else{
                    response.redirect("/groups/" + newGroup._id);
                }
            });
        })
        .catch(function(error){
            request.flash('error', "Could not create the group");
            //redirect back to index
            response.redirect("/groups/new");
        });
});

/* SHOW: GET a group */
router.get("/:id",  function (request, response) {
    Group.findById(request.params.id).exec(function (error, foundGroup){
        if(error){
            console.log(error);
            request.flash('error', 'could not find the group');
            response.redirect('/groups');
        } else {
            response.render('groups/show', {group : foundGroup});
        }
    });
});

/* DESTROY: DELETE a group */
router.delete("/:id", authenticate.groupOwnership ,  function (request, response) {
    Group.findById(request.params.id,function () {
        Group.findByIdAndDelete(request.params.id,function (error) {
            if (error) {
                request.flash('error', 'could not delete the group');
                response.redirect("/groups");
            } else {
                response.redirect("/groups");
            }
        });
    });
});

module.exports = router;

