var socketIo = require('socket.io');
var Lecture = require('./models/lecture');
var Group = require('./models/group');

// array of all lines drawn
var lecture_history = [];
var group_history =[];



function init(server){
    var io = socketIo(server, {
        handlePreflightRequest: (req, res) => {
            const headers = {
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            };
            res.writeHead(200, headers);
            res.end();
        }
    });

    io.on('connection', function(client){
        client.on('disconnect', function () {
        });
        /* deals with messages and drawings in live lecture doodle/chat */
        var lec_index = 0;
        Lecture.find({}, function (error, list){
            list.forEach(function (lecture){
                 client.on(lecture._id, function (message) {
                     if(message !== ""){
                         io.emit(lecture._id, message);
                     }
                });
         /* end of live chat */

                // first send the history to the new client
                var lecture_draw_line = lecture._id + "draw_line";
                for (var i in lecture_history[lec_index]) {
                    io.emit(lecture_draw_line, { line: lecture_history[lec_index][i] } );
                }


                // add handler for message type "draw_line".
                //
                client.on(lecture_draw_line, function (data) {
                    // add received line to history
                    if(lecture_history.length === 0){
                        lecture_history[lec_index] = [data.line];
                    } else {
                        (lecture_history[lec_index]).push(data.line);
                    }

                    // send line to all clients
                    io.emit(lecture_draw_line, { line: data.line });
                });

                // clear canvas after clicking clear button
                var lecture_clear = lecture._id + "clear";
                client.on(lecture_clear, function(){
                    if(lecture_history.length !== 0){
                        lecture_history[lec_index].splice(0,lecture_history[lec_index].length);
                        // lecture_history[lec_index].length = 0;
                        io.emit(lecture_clear, true);
                    }
                });

                lec_index++;
            });
        });
        /*
        *
        * this is the socket handler for group chat and doodle
        * this is identical to lectures section, so it should be eventually
        * refactored in to one template
        *
        * */
        var gr_index = 0;
        Group.find({}, function (error, list){
            list.forEach(function (group){
                client.on(group._id, function (message) {
                    if(message !== "") {
                        io.emit(group._id, message);
                    }
                });

                // first send the history to the new client
                var group_draw_line = group._id + "draw_line";
                for (var i in group_history[gr_index]) {
                    io.emit(group_draw_line, { line: group_history[gr_index][i] } );
                }

                // add handler for message type "draw_line".
                client.on(group_draw_line, function (data) {
                    // add received line to history
                    if(group_history.length === 0){
                        group_history[gr_index] = [data.line];
                    } else {
                        (group_history[gr_index]).push(data.line);
                    }

                    // send line to all clients
                    io.emit(group_draw_line, { line: data.line });
                });

                // clear canvas after clicking clear button
                var group_clear = group._id + "clear";
                client.on(group_clear, function(){
                    console.log(group_history);
                    if(group_history.length !== 0){
                        group_history[gr_index].length = 0;
                        io.emit(group_clear, true);
                    }
                });
                gr_index++;
            });
        });
    });

    return io;
}
module.exports = init;
