var mongoose = require("mongoose");

var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    lectures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture"
    }],
    doodles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doodle"
    }]
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
