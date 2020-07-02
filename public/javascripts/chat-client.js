
function extractURL() {
    var url = window.location.href;
    var paths = url.split('/');
    var namespace = paths[paths.length-2];
    if(namespace === ""){
        namespace = '/';
    }
    return namespace;
}

$(function () {
    var id = extractURL();

    var socket = io(); // io without an argument will auto discover

    $('#message-form').submit(function(){
        socket.emit(id, $('#message').val());
        $('#message').val('');
        return false;
    });
    socket.on(id, function(msg){
        $('#message-list').prepend($('<li>').text(msg));
        // window.scrollTo(0, document.body.scrollHeight);
    });
});

