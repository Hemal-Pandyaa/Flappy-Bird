//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -4; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

// game loop
let gameOver = false;
let score = 0;
let started = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    board.style.border = "1px solid black";
    context = board.getContext("2d");

    // drawing board background
    const background = new Image();
    background.src = "./flappybirdbg.png";
    background.onload = function () {
        context.drawImage(background, 0, 0, boardWidth, boardHeight);
    };

    // bird
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(
            birdImg,
            birdHeight,
            birdWidth,
            birdHeight,
            birdWidth,
        );
    };

    // pipes
    topPipeImg = new Image();
    topPipeImg.src = "./topPipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottomPipe.png";

    document.addEventListener("keydown", () => {
        if(!started) {
            started = true;
            setInterval(createPipe, 750);
            requestAnimationFrame(update);
        }
    });
    if(!started) {
        requestAnimationFrame(updateBeforeStart)
    }
    document.addEventListener("keydown", moveBird);
};

function update() {
    // check for game Over
    if(gameOver) {
        requestAnimationFrame(gameOverUpdate);
        return;
    }

    if(!started) {
        requestAnimationFrame(updateBeforeStart);
        return;
    }

    // clear board
    context.clearRect(0, 0, boardWidth, boardHeight);

    // draw bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // draw pipe
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        pipe.x += velocityX;

        if(!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score += 0.5;
        }
        if(detectCollision(pipe, bird)) {
            gameOver = true;
        }

        if(bird.y > boardHeight){
            gameOver = true;
        }
    }

    // move bird
    bird.y = Math.max(bird.y + velocityY, 0);
    velocityY += gravity;

    context.fillStyle = "white";
    context.font = "24px Arial";
    context.fillText(`Score: ${score}`, 5, 30);

    // animate every frame
    requestAnimationFrame(update);
}

function createPipe() {
    let randomPositionY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let minimumGap = boardHeight / 3;
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPositionY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPositionY + pipeHeight +  minimumGap,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(topPipe, bottomPipe);
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function moveBird(e){
    console.log(e)
    if(e.code == "Space"){
        velocityY = -6; //bird jumping speed
    }
}

function updateBeforeStart() {

    if(started) {
        return;
    }

    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.fillText(`Click Any Key to start`, boardWidth/8, boardHeight/6);

    context.drawImage(birdImg, boardWidth/8, boardHeight/2, birdWidth, birdHeight)

    requestAnimationFrame(updateBeforeStart)
}

function gameOverUpdate() {
    started = false;
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.fillText(`Game Over!`, boardWidth/8, boardHeight/2);
    context.fillText(`Score: ${score}`, boardWidth/8, boardHeight/2 + 50);
    context.font = "18px Arial";
    context.fillText(`Press any key to play again`, boardWidth/8, boardHeight/2 + 100);

    document.addEventListener("keydown", () => {
        location.reload();
    });

    requestAnimationFrame(gameOverUpdate);
}