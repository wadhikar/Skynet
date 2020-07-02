var mongoose = require("mongoose");

//Drawings uniquely identified by (lecture, author)
var DrawingSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture"
    },
    events: [{
        tool: String,
        colour: String,
        size: Number,
        start: {x: Number, y: Number},
        end: {x: Number, y: Number},
    }]
});

module.exports = mongoose.model("Drawing", DrawingSchema);