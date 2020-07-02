var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
    name: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    message_log : [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text : String,
        doodle: [{
            x_value: Number,
            y_value: Number
        }]
    }]
});

module.exports = mongoose.model("Group", GroupSchema);
