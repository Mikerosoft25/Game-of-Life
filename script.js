class Cell {
    constructor(x, y, alive = false) {
        this.x = x;
        this.y = y;
        this.alive = alive;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    isAlive() {
        return this.alive;
    }

    setAlive(alive) {
        this.alive = alive;
    }

    changeAlive() {
        this.alive = !this.alive;
    }

    equals(otherCell) {
        return this.x == otherCell.getX() && this.y == otherCell.getY();
    }
}

class Grid{
    constructor(rectSideLength = 20) {
        this.grid = [];
        this.lastClickedCell = null;
        this.rectSideLength = rectSideLength;
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.gameDiv = document.getElementById("gameDiv");

        this.leftMargin = 0;
        this.rightMargin = 0;
        this.topMargin = 0;
        this.bottomMargin = 0;
        this.rowCount = 0;
        this.colCount = 0;

        this.init();
        this.draw();
    }

    init(resetCells = false) {
        let canvasHeight = gameDiv.getBoundingClientRect().height;
        let canvasWidth = gameDiv.getBoundingClientRect().width;

        this.ctx.canvas.height = canvasHeight;
        this.ctx.canvas.width  = canvasWidth;

        let leftOverHorizontal = canvasWidth%this.rectSideLength;
        let leftOverVertical = canvasHeight%this.rectSideLength;

        leftOverHorizontal = (leftOverHorizontal < 20 ? 20 : leftOverHorizontal);
        leftOverVertical = (leftOverVertical < 20 ? 20 : leftOverVertical);

        
        this.leftMargin = Math.floor(leftOverHorizontal/2);
        this.rightMargin = Math.ceil(leftOverHorizontal/2);
        this.topMargin = Math.floor(leftOverVertical/2);
        this.bottomMargin = Math.ceil(leftOverVertical/2);

        let newGrid = []
        
        for (let y = this.topMargin; y + this.rectSideLength <= canvasHeight; y += this.rectSideLength) {
            let row = [];
            for (let x = this.leftMargin; x + this.rectSideLength <= canvasWidth; x += this.rectSideLength) {
                row.push(new Cell(x,y));
            }
            newGrid.push(row);
        }      
        
        if(!resetCells) {
            for (let row = 0; row < this.rowCount; row++) {
                for (let col = 0; col < this.colCount; col++) {
                    if (row < newGrid.length && col < newGrid[row].length) {
                        newGrid[row][col].setAlive(this.grid[row][col].isAlive());
                    }
                }
            }
        }

        this.grid = newGrid;
        this.rowCount = this.grid.length;
        this.colCount = this.grid[0].length;
    }

    resetLastClickedCell() {
        this.lastClickedCell = null;
    }
    
    validCellCoordinates(row, col) {
        return row > 0 && col > 0 && row < this.rowCount && col < this.colCount;
    }

    equalsLastClickedCell(row, col) {
        return this.lastClickedCell != null && this.grid[row][col].equals(this.lastClickedCell);
    }

    determineNextGeneration() {
        let newGrid = [];

        for (let i = 0; i < this.rowCount; i++){
            let rowArr = [];

            for (let j = 0; j < this.colCount; j++){            
                let aliveNeighbourCount = 0;

                // coord for top left cell of 3x3 block with i,j middle cell
                let y = i-1;
                let x = j-1;

                let row;
                let col;

                for (let k = 0; k < 3; k++) {
                    if (y < 0) {
                        row = this.rowCount - 1;
                    } else if (y >= this.rowCount) {
                        row = 0;
                    } else{
                        row = y;
                    }

                    x = j-1;
                    col = x;

                    for (let l = 0; l < 3; l++) {

                        if (x < 0) {
                            col = this.colCount - 1;
                        } else if (x >= this.colCount) {
                            col = 0;
                        } else {
                            col = x;
                        }

                        if(row !== i || col !== j) {
                            if (this.grid[row][col].isAlive()) {
                                aliveNeighbourCount++;
                            }
                        }
                        x++;
                    }
                    y++;
                }

                let currentCell = this.grid[i][j];
    
                if(currentCell.isAlive() && aliveNeighbourCount < 2) {
                    rowArr.push(new Cell(currentCell.getX(), currentCell.getY(), false));
                } else if (currentCell.isAlive() && (aliveNeighbourCount == 2 || aliveNeighbourCount == 3)){
                    rowArr.push(new Cell(currentCell.getX(), currentCell.getY(), true));
                } else if (!currentCell.isAlive() && aliveNeighbourCount == 3) {
                    rowArr.push(new Cell(currentCell.getX(), currentCell.getY(), true));
                } else{
                    rowArr.push(new Cell(currentCell.getX(), currentCell.getY(), false));
                }
            }

            newGrid.push(rowArr);
        }

        this.grid = newGrid;
    }

    draw() {
        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.colCount; col++) {
                this.drawCell(row, col);
            }
        }

        this.ctx.stroke();
    }

    drawCell(row, col) {
        let cell = this.grid[row][col];
        this.ctx.clearRect(cell.getX(), cell.getY(), this.rectSideLength, this.rectSideLength);

        if (cell.isAlive()){
            this.ctx.fillStyle = "#f05454";
            this.ctx.fillRect(cell.getX(), cell.getY(), this.rectSideLength, this.rectSideLength);
            this.ctx.strokeStyle = "#c4b6b6";
            this.ctx.strokeRect(cell.getX(), cell.getY(), this.rectSideLength, this.rectSideLength);
        } else{
            this.ctx.strokeStyle = "#c4b6b6";
            this.ctx.strokeRect(cell.getX(), cell.getY(), this.rectSideLength, this.rectSideLength);
        }
    }

    clickedCell(xCoord, yCoord) {
        let col = Math.floor((xCoord - this.leftMargin) / this.rectSideLength);
        let row = Math.floor((yCoord - this.topMargin) / this.rectSideLength);

        if (this.validCellCoordinates(row, col) && !this.equalsLastClickedCell(row, col)) {
            this.grid[row][col].changeAlive();
            this.lastClickedCell = this.grid[row][col];
            this.drawCell(row, col);
        }
    }
}

class Game {
    constructor(grid) {
        this.grid = grid;
        this.running = false;
        this.pauseTime = 1000;
        this.generation = 0;
        this.gameInterval = null;
    }

    start() {
        if(!this.running){
            this.running = true;
            this.gameInterval = setInterval(() => this.run(), this.pauseTime);
        }
    }

    stop() {
        if (this.running) {
            clearInterval(this.gameInterval);
            this.running = false;
        }
    }

    reset() {
        if (this.running) {
            clearInterval(this.gameInterval);
        }

        this.running = false;
        this.generation = 0;
        this.grid.init(true);
        this.grid.draw();
    }

    adjustPauseTimer(pauseTime) {
        this.pauseTime = pauseTime;

        if(this.running){
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => this.run(), this.pauseTime);
        }
    }

    isRunning() {
        return this.running;
    }

    getGeneration() {
        return this.generation;
    }

    run() {
        this.grid.determineNextGeneration();
        this.grid.draw();   

        this.generation++;
        document.getElementById("generationCount").innerText = this.generation;
    }
}

let generationCount = document.getElementById("generationCount");
let statusText = document.getElementById("statusText");
let startStopButton = document.getElementById("startStopButton");
let resetButton = document.getElementById("resetButton");
let pauseTime = document.getElementById("pauseTime");
let speedSlider = document.getElementById("speedSlider");

let canvas = document.getElementById("gameCanvas");
let mouseDown = false;
let grid = new Grid();
let game = new Game(grid);

window.onresize = function(){
    grid.init();
    grid.draw();
}

canvas.addEventListener("mousedown", function(ev) {
    mouseDown = true;
    canvasClickEvent(ev);
});

canvas.addEventListener("mouseup", function(ev) {
    mouseDown = false;
    grid.resetLastClickedCell();
});

canvas.addEventListener("mousemove", function(ev) {
    if (mouseDown) {
        canvasClickEvent(ev);
    }
});

function canvasClickEvent(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    grid.clickedCell(x, y);
}

startStopButton.addEventListener('click' , function(){
    if (!game.isRunning()){
        game.start();
        startStopButton.innerText = "Stop";
        statusText.innerText = "Running"
        statusText.style.color = "#20df20";
    } else{
        game.stop();
        startStopButton.innerText = "Start";
        statusText.innerText = "Stopped"
        statusText.style.color = "#f05454";
    }
});

resetButton.addEventListener('click', function(){
    game.reset();

    startStopButton.innerText = "Start";
    statusText.innerText = "Stopped";
    statusText.style.color = "#f05454";
    generationCount.innerText = "0";
    running = false;
    generation = 0;
});

speedSlider.addEventListener('input', function(){
    let pauseVal = speedSlider.value;
    pauseTime.innerText = pauseVal;

    game.adjustPauseTimer(pauseVal);
});