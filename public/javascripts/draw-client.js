var drawNamespace = io.connect();

// Load canvas
document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas  = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var canvasContainer = document.getElementById('drawingContainer');
    var width   = canvasContainer.clientWidth * .95;
    var height  = canvasContainer.clientHeight *.95;

    canvas.width = width;
    canvas.height = height;

    function findPos(obj){

        var curleft = curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return [curleft, curtop]
    }

    var canvasOffset = findPos(canvas);
    // console.log(canvasOffset);
    var offsetX=canvasOffset[0];
    var offsetY=canvasOffset[1];
    var canvasWidth=canvas.width;
    var canvasHeight=canvas.height;
    var isDragging=false;

    // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };

    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        console.log(e.clientX);
        console.log(e.clientY);
        mouse.pos.x = e.clientX / canvasWidth;
        mouse.pos.y = (e.clientY - offsetY) / canvasHeight;
        console.log(mouse.pos.x);
        console.log(mouse.pos.y);
        mouse.move = true;
    };


    var id = extractLiveURL();
    var lecture_draw_line = id+ "draw_line";
    var lecture_clear = id + "clear";
    var lecture_drag = id + "drag";

    // draw line received from server
    drawNamespace.on(lecture_draw_line, function (data) {
        console.log(lecture_draw_line);
        var line = data.line;
        // context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    // Clear canvas
    drawNamespace.on(lecture_clear, function(){
        context.clearRect(0, 0, width, height);
    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            drawNamespace.emit(lecture_draw_line, {line: [mouse.pos, mouse.pos_prev]});
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }
    mainLoop();

    document.getElementById('drawing').addEventListener('click', function() {

        function handleMouseDown(e){
            canMouseX=parseInt(e.clientX-offsetX);
            canMouseY=parseInt(e.clientY-offsetY);
            // set the drag flag
            isDragging=true;
        }

        function handleMouseUp(e){
            canMouseX=parseInt(e.clientX-offsetX);
            canMouseY=parseInt(e.clientY-offsetY);
            // clear the drag flag
            isDragging=false;
        }

        function handleMouseOut(e){
            canMouseX=parseInt(e.clientX-offsetX);
            canMouseY=parseInt(e.clientY-offsetY);
            // user has left the canvas, so clear the drag flag
            isDragging=false;
        }

        function handleMouseMove(e){

            if(!isDragging){return;}
            e.preventDefault();
            e.stopPropagation();
            canMouseX=parseInt(e.clientX-offsetX);
            canMouseY=parseInt(e.clientY-offsetY);
            // if the drag flag is set, clear the canvas and draw the image
            if(isDragging){
                drawNamespace.emit(lecture_drag , [canMouseX, canMouseY])
            }
        }
    });

});

function extractLiveURL() {
    var url = window.location.href;
    var paths = url.split('/');
    var id = paths[paths.length-2];
    return id;
}

function clearit(){
    var id = extractLiveURL();
    var lecture_clear = id + "clear";
    drawNamespace.emit(lecture_clear, true);
}
