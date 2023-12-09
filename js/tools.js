const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#drawing-color"),
ctx = canvas.getContext("2d");

//global variables with default value
let prevMouseX, prevMouseY, snapshot,
isDrawing = false;
selectedTool = "text",
brushWidth = 3;

window.addEventListener("load", () => {
    //setting canvas width/height.. offsetwidth/height reutrns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
})

const drawRect = (e) => {
    //if fillColor isn't checked draw a rect with border else draw rect with background
    if(!fillColor.checked){
        //creating circle according to the mouse pointer
      return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);  
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);  
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;//passing current mouseX position as preMouseX value
    prevMouseY = e.offsetY;//passing current mouseX position as preMouseY value
    ctx.beginPath();//creating new path to draw
    ctx.lineWidth = brushWidth; //passing brushsize as line width
    snapshot = ctx.getImageData(0,0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) reutrn;//isDrawing is false return from here
    ctx.putImageData(snapshot, 0, 0); //adding copied canvas data on this canvas

    if(selectedTool === "text") {
        ctx.lineTo(e.offsetX, e.offsetY);//creating line according to the mouse pointer
        ctx.stroke();//drawing/filling line with color
    }else if(selectedTool === "rectangle") {
        drawRect(e);
    }
}

//left-slide bar btn control

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {  //adding click event to all tool option
        //removing active class from the previous option and adding on current clicked option
        document.querySelector(".left-option .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});


canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);