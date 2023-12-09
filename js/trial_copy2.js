document.getElementById('select-mode').onclick = function() { toggleDrawingMode('select'); };



let isGrouped;
// Initialization and setup
var canvasHistory = [];
var currentIndex = -1;
var isUndoRedoOperation = false;
var historySizeLimit = 20; // Set the maximum size of the history
var drawingModeEl = document.getElementById('drawing-mode');
var isDrawing = drawingModeEl.getAttribute('drawing');

var drawingOptionsEl = document.getElementById('drawing-mode-options');
var drawingColorEl = document.getElementById('drawing-color');
var drawingShadowColorEl = document.getElementById('drawing-shadow-color');
var drawingLineWidthEl = document.getElementById('drawing-line-width');
var drawingShadowWidth = document.getElementById('drawing-shadow-width');
var drawingShadowOffset = document.getElementById('drawing-shadow-offset');
var canvas = new fabric.Canvas('c', {
fireRightClick: true,
stopContextMenu: true,
isDrawingMode: !isDrawing,
preserveObjectStacking: true,
});

fabric.Object.prototype.cornerSize = 8; // Adjust the size as needed
fabric.Object.prototype.transparentCorners = false;

$(document).bind('contextmenu', function(e) {
e.preventDefault();
});

let pastetext = document.querySelector("#paste");

// New global variables for drawing modes
let isDrawingRectangleMode = false;
let isDrawingCircleMode = false;
let currentShape; // Current drawing shape (rectangle or circle)
let startX, startY; // Starting point coordinates
let tooltip; // Tooltip for dimensions display

// Initialize free drawing settings (but do not set it as active)
function initializeFreeDrawing() {
var brush = new fabric.PencilBrush(canvas);
brush.color = drawingColorEl.value;
brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
brush.shadow = new fabric.Shadow({
    blur: parseInt(drawingShadowWidth.value, 10) || 0,
    offsetX: parseInt(drawingShadowOffset.value, 10) || 0,
    offsetY: parseInt(drawingShadowOffset.value, 10) || 0,
    affectStroke: true,
    color: drawingShadowColorEl.value,
});
return brush;
}
// Assign the initialized brush to the canvas (without enabling drawing mode)
canvas.freeDrawingBrush = initializeFreeDrawing();

// Function to toggle drawing mode
function toggleDrawingMode(mode) {
// Check if free drawing mode is already active
if (mode === 'free' && canvas.isDrawingMode) {
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    return; // Exit the function early
}

// Reset all drawing modes
isDrawingRectangleMode = false;
isDrawingCircleMode = false;
canvas.isDrawingMode = false;
canvas.defaultCursor = 'default'; // Reset cursor to default

// Additional logic based on the mode
switch (mode) {
    case 'rectangle':
        isDrawingRectangleMode = true;
        canvas.defaultCursor = 'crosshair';
        break;
    case 'circle':
        isDrawingCircleMode = true;
        canvas.defaultCursor = 'crosshair';
        break;
    case 'free':
        canvas.isDrawingMode = true;
        break;
    case 'select':
        // No additional actions needed for select mode
        break;
}
}


// Event listeners for drawing mode buttons
document.getElementById('rect').onclick = function() { toggleDrawingMode('rectangle'); };
document.getElementById('circ').onclick = function() { toggleDrawingMode('circle'); };
drawingModeEl.onclick = function() { toggleDrawingMode('free'); };

canvas.on("mouse:down", function(e) {
if (isDrawingRectangleMode || isDrawingCircleMode) {
    const pointer = canvas.getPointer(e.e);
    const currentColor = drawingColorEl.value; // Get the current selected color

    startX = pointer.x;
    startY = pointer.y;
    currentShape = isDrawingRectangleMode ? new fabric.Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: currentColor, // Use the selected color
        strokeWidth: 5
    }) : new fabric.Circle({
        left: startX,
        top: startY,
        radius: 0,
        fill: 'transparent',
        stroke: currentColor, // Use the selected color
        strokeWidth: 5,
        originX: 'center',
        originY: 'center'
    });

    canvas.add(currentShape);

}
});

// Mouse move event for updating shapes
canvas.on("mouse:move", function(e) {
if ((isDrawingRectangleMode || isDrawingCircleMode) && currentShape) {
    const pointer = canvas.getPointer(e.e);

    if (isDrawingRectangleMode) {
        let width = pointer.x - startX;
        let height = pointer.y - startY;
        currentShape.set({
            left: width > 0 ? startX : pointer.x,
            top: height > 0 ? startY : pointer.y,
            width: Math.abs(width),
            height: Math.abs(height)
        });
    } else if (isDrawingCircleMode) {
        let radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2));
        currentShape.set({ radius: radius });
    }

    currentShape.setCoords();
    canvas.renderAll();
    updateTooltip(e.e.clientX, e.e.clientY, currentShape);
}
});

// Function to update the tooltip
function updateTooltip(x, y, shape) {
// Create tooltip if it doesn't exist
if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "fixed";
    tooltip.style.backgroundColor = "black";
    tooltip.style.padding = "5px";
    tooltip.style.border = "1px solid black";
    tooltip.style.zIndex = "12";
    document.body.appendChild(tooltip);
}

// Display tooltip with dimensions
tooltip.style.display = "block";
tooltip.style.left = (x + 10) + "px";
tooltip.style.top = (y + 10) + "px";

if (isDrawingRectangleMode) {
    let width = Math.round(shape.width);
    let height = Math.round(shape.height);
    tooltip.textContent = `Width: ${width}, Height: ${height}`;
} else if (isDrawingCircleMode) {
    let radius = Math.round(shape.radius);
    tooltip.textContent = `Radius: ${radius}`;
}
}

// Mouse up event to finalize shape drawing
canvas.on("mouse:up", function() {
if (isDrawingRectangleMode && currentShape) {
    isDrawingRectangleMode = false; // Reset drawing mode
    canvas.defaultCursor = 'default'; // Reset cursor to default
    tooltip.style.display = "none"; // Hide the tooltip
    currentShape = null; // Reset currentShape for the next drawing
} else if (isDrawingCircleMode && currentShape) {
    isDrawingCircleMode = false; // Reset drawing mode
    canvas.defaultCursor = 'default'; // Reset cursor to default
    tooltip.style.display = "none"; // Hide the tooltip
    currentShape = null; // Reset currentShape for the next drawing
}
console.log(canvasHistory)
});

// Additional code for free drawing brush configuration
let drawingModeSelector = document.getElementById('drawing-mode-selector');
drawingModeSelector.onchange = function() {
let isDrawingTool = ['Pencil', 'Circle', 'Spray'].includes(this.value);

if (isDrawingTool) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
    canvas.freeDrawingBrush.color = drawingColorEl.value;
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: parseInt(drawingShadowWidth.value, 10) || 0,
        offsetX: parseInt(drawingShadowOffset.value, 10) || 0,
        offsetY: parseInt(drawingShadowOffset.value, 10) || 0,
        affectStroke: true,
        color: drawingShadowColorEl.value,
    });
} else {
    canvas.isDrawingMode = false;
}
};

var currentDrawingColor;
drawingColorEl.oninput = function() {
// if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = this.value;
// }
};
drawingShadowColorEl.oninput = function() {
if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.shadow.color = this.value;
}
};
drawingLineWidthEl.onchange = function() {
if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
}
};
drawingShadowWidth.onchange = function() {
if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
}
};
drawingShadowOffset.onchange = function() {
if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
    canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
}
};
drawingModeEl.onclick = function() { toggleDrawingMode('free'); };

// Other functionalities can be added below as needed


///////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to save the current canvas state to history
function saveToHistory() {
        if (!isUndoRedoOperation) {
            const currentCanvasState = JSON.stringify(canvas.toJSON());
            // Check if the current state is different from the last saved state
            const lastSavedState = canvasHistory[currentIndex];
            if (currentCanvasState !== lastSavedState) {
                // Remove any future states if they exist
                canvasHistory = canvasHistory.slice(0, currentIndex + 1);
                currentIndex++;
                canvasHistory[currentIndex] = JSON.stringify(canvas.toJSON());
                // Drop the oldest states until the history size is within the limit
                while (canvasHistory.length > historySizeLimit) {
                    canvasHistory.shift();
                    currentIndex--;
                    if (currentIndex < 0) {
                        currentIndex = 0; // Ensures currentIndex doesn't go below 0
                    }
                }
            }
        }
    }

    // Fabric.js events to detect changes
    canvas.on('object:modified', saveToHistory);
    canvas.on('object:added', saveToHistory);
    const menu = document.querySelector("#context-menu");
    fabric.util.addListener(document.getElementsByClassName('upper-canvas')[0], 'contextmenu', function(e) {
        checkGroupedObjects();
        var cnvsPos = $('#canvas-container').offset();
        curX = e.clientX  - 50;
        console.log(curX,cnvsPos.left);
        curY = e.clientY - cnvsPos.top/2 - 20;
        console.log(curY,cnvsPos.top);
        // curX = e.clientX - menu.offsetWidth/2;
        // curY = e.clientY - menu.offsetHeight - 10;
        $('#context-menu').css({'top': curY, 'left': curX}).fadeIn('fast');
        //console.log("Position of the cursor point" + curX + "," + curY);
    });
    $(document).click(function(event) {
    if (!$(event.target).closest('#context-menu').length) {
        if ($('#context-menu').css("display", "flex")) {
            $('#context-menu').css("display", "none");
        }
    }
    });


    $(document).on('click', '#group', function(evt) {
        $('#context-menu').hide();
        console.log(isGrouped);
        if (isGrouped) {
            canvas.getActiveObject().toActiveSelection();
            canvas.requestRenderAll();
            isGrouped = false;
        } else {
            canvas.getActiveObject().toGroup();
            canvas.requestRenderAll();
        }
    });

    document.getElementById("undo").addEventListener("click", undo);
    function undo() {
        if (currentIndex > 0) {
            isUndoRedoOperation = true;
            currentIndex--;
            const previousState = canvasHistory[currentIndex];
            canvas.loadFromJSON(previousState, function() {
                canvas.renderAll();
                isUndoRedoOperation = false;
            });
        }
    }

    document.getElementById("redo").addEventListener("click", redo);
    function redo() {
        if (currentIndex < canvasHistory.length - 1) {
            isUndoRedoOperation = true;
            currentIndex++;
            const nextState = canvasHistory[currentIndex];
            canvas.loadFromJSON(nextState, function() {
                canvas.renderAll();
                isUndoRedoOperation = false;
            });
        }
    }

    document.getElementById("clear").addEventListener("click", function () {
        canvas.clear();
        console.log(canvasHistory[currentIndex]);
        // canvas.setBackgroundColor('white', canvas.renderAll.bind(canvas));
        saveToHistory();
    });


    // Save initial state
    saveToHistory();
    updatePasteButtonVisibility();


    document.addEventListener('keydown', function(event) {
        // Check if the Ctrl key is pressed (Ctrl key has key code 17)
        if (event.ctrlKey || event.metaKey) {
            // Check for Ctrl+Z (undo) on Windows or Command+Z on Mac
            if ((event.key === 'z' || event.key === 'Z') && !event.shiftKey) {
                event.preventDefault(); // Prevent the browser's default Ctrl+Z or Command+Z behavior
                undo(); // Call the undo function
            }
            // Check for Ctrl+R (redo) on Windows or Command+R on Mac
            else if ((event.key === 'r' || event.key === 'R') && !event.shiftKey) {
                event.preventDefault(); // Prevent the browser's default Ctrl+R or Command+R behavior
                redo(); // Call the redo function
            }
        }
    });


    // Function to remove the selected object
    function removeSelectedObject() {
        var activeObject = canvas.getActiveObject();

        if (activeObject) {
            // Check if the selection is a group of objects
            if (activeObject.type === 'activeSelection') {
                activeObject.forEachObject(function(obj) {
                    canvas.remove(obj);
                });
                // Deselect the group after removing its objects
                canvas.discardActiveObject();
            } else {
                // If it's a single object, just remove it
                canvas.remove(activeObject);
            }
            canvas.requestRenderAll();
            saveToHistory();
        }
    }



    $("#save").on("click", function(e) {
                $(".save").html(canvas.toSVG());
    });


    function checkGroupedObjects() {
        let group = document.getElementById("group");
        let activeObject = canvas.getActiveObject();
        // Check if there is an active object
        if (activeObject) {
            // Check if the active object is a group
            console.log(activeObject.type);
            if (activeObject && activeObject.type === 'group') {
                group.style.display = "flex";
                group.textContent = "Ungroup";
                isGrouped = true;
            } else {
                group.style.display = "flex";
                group.textContent = "Group";
                isGrouped = false;
            }
        } else {
            // Default text or action when no object is selected
                group.style.display = "none";
        }
    }

//     canvas.on('object:moved', function(e) {
//         console.log('Object moved');
//     });
// $("#text").on("click", function(e) {
// text = new fabric.Text($("#text").val(), { left: 100, top: 100 });
// 	  canvas.add(text);
// });
// $("#rect").on("click", function(e) {
//   	rect = new fabric.Rect({
//     left: 40,
//     top: 40,
//     width: 50,
//     height: 50,      
//     fill: 'transparent',
//     stroke: 'green',
//     strokeWidth: 5,
// 			  });  
//   canvas.add(rect);
// });

// $("#circ").on("click", function(e) {
//   	rect = new fabric.Circle({
//     left: 40,
//     top: 40,
//     radius: 50,     
//     fill: 'transparent',
//     stroke: 'green',
//     strokeWidth: 5,
// 			  });  
//   canvas.add(rect);
// });

// $("#save").on("click", function(e) {
//   	$(".save").html(canvas.toSVG());
// });

// text mode
var isTextMode = false;
var placeholderText = 'Edit me'; // Placeholder text

// Toggle text adding mode and change cursor
document.getElementById('add-text').addEventListener('click', function() {
isTextMode = !isTextMode;
canvas.defaultCursor = isTextMode ? 'text' : 'default';
canvas.renderAll(); // Re-render the canvas to apply the cursor change
});

// Add a text box at the click position and revert cursor
canvas.on('mouse:down', function(options) {
if (isTextMode) {
    var pointer = canvas.getPointer(options.e);
    var text = new fabric.IText(placeholderText, {
        left: pointer.x,
        top: pointer.y,
        fontFamily: 'Titillium Web',
        fill: 'black',
        fontStyle: 'italic',
        fontSize: 23,
        opacity: 0.5
    });

    text.on('editing:entered', function() {
        if (this.text === placeholderText) {
            this.text = '';
            this.opacity = 1; // Reset opacity
            this.fontStyle = 'normal'; // Reset font style
        }
    });

    text.on('editing:exited', function() {
        if (this.text === '') {
            this.text = placeholderText;
            this.opacity = 0.5; // Apply transparency
            this.fontStyle = 'italic'; // Apply italic font style
        }
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();

    isTextMode = false; // Turn off text mode after adding the text box
    canvas.defaultCursor = 'default'; // Set the cursor back to default
    canvas.renderAll(); // Re-render the canvas to apply the cursor change
}
});

//         // Binding the Backspace key to remove the selected object
//         document.addEventListener('keydown', function(event) {
//     console.log(isTextMode);
//     if ((event.key === 'Backspace' || event.key === 'Delete') && !isTextMode) {
//         event.preventDefault(); // Prevent the default backspace action
//         removeSelectedObject(); // Remove the selected object
//     }
//     // If isTextMode is true, the default behavior (editing text) will occur
// });



document.addEventListener('DOMContentLoaded', function() {
document.querySelector('#theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    var sunIcon = document.getElementById('sun');
    var moonIcon = document.getElementById('moon');
    sunIcon.style.display = sunIcon.style.display === 'none' ? 'block' : 'none';
    moonIcon.style.display = moonIcon.style.display === 'none' ? 'block' : 'none';
});
});
function resizeCanvas() {
var container = document.getElementById('canvas-container');

canvas.width = container.clientWidth;
canvas.height = container.clientHeight;
}
// Adjust canvas size when the window is resized
window.addEventListener('resize', resizeCanvas);

// Initial adjustment
resizeCanvas();

document.querySelectorAll('.nav-link').forEach(link => {
link.addEventListener('mouseenter', (e) => {
    const hoverBg = link.querySelector('.hover-bg');
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    hoverBg.style.transformOrigin = x < rect.width / 2 ? 'left' : 'right';
    hoverBg.style.transform = 'scaleX(1)';
});

link.addEventListener('mouseleave', (e) => {
    const hoverBg = link.querySelector('.hover-bg');
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    hoverBg.style.transformOrigin = x < rect.width / 2 ? 'left' : 'right';
    hoverBg.style.transform = 'scaleX(0)';
});
});



var dataPoints = [
{ x: 10, y: 50 }, 
{ x: 50, y: 30 },
{ x: 90, y: 70 },
// Add more points as needed
];

// Function to draw a line between two points
function drawLine(point1, point2) {
var line = new fabric.Line([point1.x, point1.y, point2.x, point2.y], {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 2,
});
canvas.add(line);
}

// Draw the line plot
for (var i = 0; i < dataPoints.length - 1; i++) {
drawLine(dataPoints[i], dataPoints[i + 1]);
}
