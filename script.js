let cells;
let gameInterval;
let generation = 0;
let boxCountHorizontal = 80;
let gameSpeed = 1000;
let mouseDown = false;
let running = false;

window.onload = function() {
    document.onmousedown = () => mouseDown = true;
    document.onmouseup = () => mouseDown = false;

    populateTable();

    let generationCount = document.getElementById("generationCount");
    let statusText = document.getElementById("statusText");
    let startStopButton = document.getElementById("startStopButton");
    let resetButton = document.getElementById("resetButton");
    let pauseTime = document.getElementById("pauseTime");
    let speedSlider = document.getElementById("speedSlider");

    startStopButton.addEventListener('click', function(){
        if(!running){
            gameInterval = setInterval(determineNextGeneration, gameSpeed);
            startStopButton.innerText = "Stop";
            statusText.innerText = "Running"
            statusText.style.color = "#20df20";
        } else{
            clearInterval(gameInterval);
            startStopButton.innerText = "Start";
            statusText.innerText = "Stopped"
            statusText.style.color = "#f05454";
        }
        running = !running;
    });

    resetButton.addEventListener('click', function(){
        if(gameInterval != null){
            clearInterval(gameInterval)
        }
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                cells[i][j] = 0;
                colorCell(i,j);
            }
        }

        startStopButton.innerText = "Start";
        statusText.innerText = "Stopped";
        generationCount.innerText = "0";
        running = false;
        generation = 0;
    });

    speedSlider.addEventListener('input', function(){
        gameSpeed = speedSlider.value;
        pauseTime.innerText = gameSpeed;
        if(running){
            clearInterval(gameInterval);
            gameInterval = setInterval(determineNextGeneration, gameSpeed);
        }
    });
}

window.onresize = function() {
    populateTable();
}

function addGeneration() {
    generation++;
    document.getElementById("generationCount").innerText = generation;
}

function populateTable() {
    let gameTable = document.getElementById("gameTable");
    let game = document.getElementById("game");
    let gameWidth = game.offsetWidth;
    let gameHeight = game.offsetHeight;
    let initialize = (cells == null);
    let cellsCopy;

    console.log("initialize", initialize);
    console.log("gameWidth: ", gameWidth);
    console.log("gameHeight: ", gameHeight);

    let cellWidth = gameWidth / boxCountHorizontal;
    let cellHeight = gameWidth / boxCountHorizontal;

    console.log("cellWidth: ", cellWidth);
    console.log("cellHeight: ", cellHeight);

    let boxCountVertical = Math.floor(gameHeight/cellHeight) - 1;

    console.log("boxCountVertical: ", boxCountVertical);

    while (gameTable.firstChild) {

        gameTable.removeChild(gameTable.lastChild);
    }

    if(!initialize){
        cellsCopy = new Array(cells.length);
        for (let i = 0; i < cellsCopy.length; i++) {
            cellsCopy[i] = cells[i].slice();
        }
    }

    cells = new Array(boxCountVertical);

    for (let i = 0; i < boxCountVertical; i++){
        let tr = document.createElement('tr');

        cells[i] = new Array(boxCountHorizontal);

        for (let j = 0; j < boxCountHorizontal; j++){
            let td = document.createElement('td');
            td.style.width = cellWidth + "px";
            td.style.height = cellHeight + "px";

            td.addEventListener('click', function (){
                if(cells[i][j] === 0){
                    cells[i][j] = 1;
                    colorCell(i, j);
                } else{
                    cells[i][j] = 0;
                    colorCell(i, j);
                }
            });

            td.addEventListener('mouseover', function(){
                if(mouseDown){
                    if(cells[i][j] === 0){
                        cells[i][j] = 1;
                        colorCell(i, j);
                    } else{
                        cells[i][j] = 0;
                        colorCell(i, j);
                    }
                }
            });

            tr.appendChild(td);
            if(initialize){
                cells[i][j] = 0;
            } else{
                if(i < cellsCopy.length){
                    cells[i][j] = cellsCopy[i][j];
                } else{
                    cells[i][j] = 0;
                }
            }
        }

        gameTable.appendChild(tr);
    }

    for (let i = 0; i < cells.length; i++){
        for (let j = 0; j < cells[i].length; j++) {
            colorCell(i, j);
        }
    }
}

function colorCell(row, col){
    let cell = document.getElementById("gameTable").rows[row].cells[col];
    if(cells[row][col] === 1){
        cell.style.background = "#f05454";
    } else{
        cell.style.background = "none";
    }
}

function determineNextGeneration() {
    let cellsCopy = new Array(cells.length);
    for (let i = 0; i < cellsCopy.length; i++) {
        cellsCopy[i] = cells[i].slice();
    }

    for (let i = 0; i < cells.length; i++) {
        for(let j = 0; j < cells[i].length; j++) {
            let aliveNeighbourCount = 0;

            // coord for top left cell of 3x3 block with i,j middle cell
            let x = i-1;
            let y = j-1;

            let row;
            let col;

            for (let k = 0; k < 3; k++) {
                if(x < 0){
                    row = cells.length - 1;
                } else if(x >= cells.length){
                    row = 0;
                } else{
                    row = x;
                }

                y = j-1;
                col = y;

                for (let l = 0; l < 3; l++) {

                    if(y < 0){
                        col = cells[row].length - 1;
                    } else if(y >= cells[row].length){
                        col = 0;
                    } else{
                        col = y;
                    }

                    if(row !== i || col !== j){
                        aliveNeighbourCount += cells[row][col];
                    }
                    y++;
                }
                x++;
            }

            if(cells[i][j] === 0){ //dead
                if(aliveNeighbourCount === 3) {
                    cellsCopy[i][j] = 1;
                }
            } else{ //alive
                if(aliveNeighbourCount < 2 || aliveNeighbourCount > 3) {
                    cellsCopy[i][j] = 0;
                }
            }
        }
    }

    cells = cellsCopy;
    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
            colorCell(i, j);
        }
    }
    addGeneration();
}
