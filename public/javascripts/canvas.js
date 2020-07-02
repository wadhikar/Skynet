// Check for the canvas tag onload.
var context;
var canvas, canvasContainer, contexto;
var lineArr = [];
var background_file, imageContainer, maxWidth, minHeight;
// Default tool. (pen, eraser)
var tool;
var tool_default = 'pen';
var tools = {};
/* line color and width variables */
var lineColor = "black";
var lineWidth = 5;

// start doodle button, adds the doodle script
var startDoodle;

/*<------Tools------>*/
// Pen tool.
tools.pen = function () {
    var tool = this;
    this.started = false;
    var line = {};
    context.globalCompositeOperation = "source-over";
    // Begin drawing with the pen tool.
    this.mousedown = function (ev) {
        line.start = {x: ev._x, y: ev._y};
        context.beginPath();
        context.moveTo(line.start.x, line.start.y);
        tool.started = true;
    };
    this.mousemove = function (ev) {
        if (tool.started) {
            line.end = {x: ev._x, y: ev._y};
            context.lineTo(line.end.x, line.end.y);
            context.stroke();
            //add stroke into lineArr, keeping track of strokes
            lineArr.push({
                tool: "pen",
                colour: context.strokeStyle,
                size: context.lineWidth,
                start: {x: line.start.x, y: line.start.y},
                end: {x: line.end.x, y: line.end.y},
            });
            var historyEntry = document.getElementById("historyInput");
            historyEntry.value = JSON.stringify(lineArr);
            line.start.x = line.end.x;
            line.start.y = line.end.y;
            // printMousePos(ev);
        }
    };
    this.mouseup = function (ev) {
        if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
        }
    };
    this.mouseleave = function (ev) {
        if (tool.started) {
            tool.mouseup(ev);
        }
    };
    this.touchstart = function (ev) {
        tool.mousedown(ev);
    };
    this.touchmove = function (ev) {
        tool.mousemove(ev);
    };
    this.touchend = function (ev) {
        tool.mouseup(ev);
    };
};

// Eraser tool.
tools.eraser = function () {
    var tool = this;
    this.started = false;
    var line = {};
    context.globalCompositeOperation = "destination-out";
    //Begin erasing
    this.mousedown = function (ev) {
        line.start = {x: ev._x, y: ev._y};
        context.beginPath();
        context.moveTo(line.start.x, line.start.y);
        tool.started = true;
    };

    this.mousemove = function (ev) {
        if (tool.started) {
            line.end = {x: ev._x, y: ev._y};
            context.lineTo(line.end.x, line.end.y);
            context.stroke();
            //add stroke into lineArr, keeping track of strokes
            lineArr.push({
                tool: "eraser",
                colour: context.strokeStyle,
                size: context.lineWidth,
                start: {x: line.start.x, y: line.start.y},
                end: {x: line.end.x, y: line.end.y},
            });
            var historyEntry = document.getElementById("historyInput");
            historyEntry.value = JSON.stringify(lineArr);
            line.start.x = line.end.x;
            line.start.y = line.end.y;
        }
    };
    this.mouseup = function (ev) {
        if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
        }
    };
    this.mouseleave = function (ev) {
        if (tool.started) {
            tool.mouseup(ev);
        }
    };
    this.touchstart = function (ev) {
        tool.mousedown(ev);
    };
    this.touchmove = function (ev) {
        tool.mousemove(ev);
    };
    this.touchend = function (ev) {
        tool.mouseup(ev);
    };
};


window.addEventListener('load', startCanvas);
window.addEventListener('load', listenToButton);

// Create a select field with our tools

var tool_select = document.getElementById('selector');
if (tool_select) {
    tool_select.addEventListener('change', ev_tool_change, false);
}

//<------line Color and Width Setup------>//

var lineWidth_select= document.getElementById('lineWidth');
if (lineWidth_select) {
    lineWidth_select.addEventListener('change', function (event) {
        context.lineWidth = lineWidth_select.value;
    });
}
var lineColor_select= document.getElementById('lineColor');
if (lineColor_select) {
    lineColor_select.addEventListener('change', function (event) {
        context.strokeStyle = lineColor_select.value;
    });
}

/* Add the event listener only after the start-doodle button in clicked
* Start-doodle is only shown to the owner of a lecture */
function listenToButton() {
    /* start doodle button */
    startDoodle = document.getElementById('start-doodle');
    if(startDoodle){
        startDoodle.addEventListener('click', doodle);
    }
}
function doodle() {
        // Event Listeners.
        //local client events
        canvas.addEventListener('mousedown', ev_canvas, false);
        canvas.addEventListener('mousemove', ev_canvas, false);
        canvas.addEventListener('mouseup',   ev_canvas, false);
        canvas.addEventListener('mouseleave', ev_canvas, false);
        //add touch input
        canvas.addEventListener('touchstart', ev_canvas, false);
        canvas.addEventListener('touchend', ev_canvas, false);
        canvas.addEventListener('touchmove', ev_canvas, false);

        activatePen();
}

function startCanvas() {
    setupCanvas();
    addTempCanvas();
    drawHistory();
}

function setupCanvas () {

    //<------Canvas Setup------>//
    canvasContainer = document.getElementById('drawingCanvas');
    if (!canvasContainer) {
        alert('Error! The canvas element was not found!');
        return;
    }
    // Create 2d canvas.
    contexto = canvasContainer.getContext('2d');
    if (!contexto) {
        alert('Error! Failed to getContext!');
        return;
    }

    /* adding background image */
    background_file = document.getElementById("background_file");
    imageContainer = document.querySelector('#drawingColumn');
    maxWidth = background_file.width;
    minHeight = background_file.height;
    if (imageContainer.clientWidth < background_file.width) {
        maxWidth = imageContainer.clientWidth;
        minHeight = minHeight * maxWidth / background_file.width;
    }
    imageContainer.clientHeight = minHeight;
    contexto.canvas.width = maxWidth;
    contexto.canvas.height = minHeight;

    /* Draw the image into the canvas */
    contexto.drawImage(background_file, 0, 0, maxWidth, minHeight);
}

function addTempCanvas() {
    // Build the temporary canvas.
    var container = canvasContainer.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
        alert('Error! Cannot create a new canvas element!');
        return;
    }
    canvas.id = 'tempCanvas';
    canvas.width  = maxWidth;
    canvas.height = minHeight;
    container.appendChild(canvas);
    context = canvas.getContext('2d');
    context.strokeStyle = lineColor;// Default line color.
    context.lineWidth = lineWidth;// Default stroke weight.
}


function activatePen() {
    // Activate the default tool (pen).
    if (tools[tool_default]) {
        tool = new tools[tool_default];
        // tool_select.value = tool_default;
    }
}

function drawHistory() {
    var drawingHistoryFromServer = document.getElementById("historyInput").value;
    var parsedHistory = JSON.parse(drawingHistoryFromServer);
    parsedHistory.forEach(function(element){
        if (element.tool === 'pen') {
            context.globalCompositeOperation = "source-over";
        } else {
            //using eraser tool
            context.globalCompositeOperation = "destination-out";
        }
        context.strokeStyle = element.colour;// Default line color.
        context.lineWidth = element.size;// Default stroke weight.
        context.beginPath();
        context.moveTo(element.start.x, element.start.y);
        context.lineTo(element.end.x, element.end.y);
        context.stroke();
    });
    //reset settings to default
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;
}

// Get the mouse position.
function ev_canvas (ev) {
    if (ev.layerX || ev.layerX === 0) { // Firefox
        ev._x = ev.layerX;
        ev._y = ev.layerY;
    }
    else if (ev.offsetX || ev.offsetX === 0) { // Opera
        ev._x = ev.offsetX;
        ev._y = ev.offsetY;
    }
    // Get the tool's event handler.
    var func = tool[ev.type];
    if (func) {
        func(ev);
    }
}

function ev_tool_change () {
    if (tools[this.value]) {
        tool = new tools[this.value]();
        tool_default = this.value;
    }
}

// Debug
function printMousePos(event) {
    console.log("clientX: " + event.clientX);
    console.log("clientY: " + event.clientY);
}
