let board;
const boardWidth = 360;
const boardHeight = 640;
let context;

// Bird properties
const bird = {
  width: 34,
  height: 24,
  x: boardWidth / 8,
  y: boardHeight / 2,
  velocityY: 0,
  img: new Image(),
};
bird.img.src = "./flappybird.png";

// Pipes properties
const pipes = [];
const pipeWidth = 64;
const pipeHeight = 512;
const pipeGap = boardHeight / 3;

const topPipeImg = new Image();
topPipeImg.src = "./toppipe.png";
const bottomPipeImg = new Image();
bottomPipeImg.src = "./bottompipe.png";

// Game physics
const gravity = 0.4;
const velocityX = -4;

// Game state
let gameOver = false;
let score = 0;
let started = false;
let saved = false;

const scores = JSON.parse(localStorage.getItem("scores")) || [];
let reloaded = false;

window.onload = () => {
  initializeGame();
};

function initializeGame() {
  createScoreBoard();
  setupBoard();
  setupBackground();
  setupBird();
  addEventListeners();

  if (!started) {
    requestAnimationFrame(updateBeforeStart);
  }
}

function setupBoard() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  board.style.border = "1px solid black";
  context = board.getContext("2d");
}

function setupBackground() {
  const background = new Image();
  background.src = "./flappybirdbg.png";
  background.onload = () => context.drawImage(background, 0, 0, boardWidth, boardHeight);
}

function setupBird() {
  bird.img.onload = () => context.drawImage(bird.img, bird.x, bird.y, bird.width, bird.height);
}

function addEventListeners() {
  document.addEventListener("keydown", handleStart);
  document.addEventListener("click", handleStart);
}

function handleStart() {
  if (!started) {
    started = true;
    document.removeEventListener("keydown", handleStart);
    document.removeEventListener("click", handleStart);
    document.addEventListener("keydown", moveBird);
    document.addEventListener("click", moveBird);
    requestAnimationFrame(update);
    setInterval(createPipe, 750);
  }
}

function update() {
  if (gameOver) {
    requestAnimationFrame(gameOverUpdate);
    return;
  }

  clearBoard();
  drawBackground();
  drawBird();
  updatePipes();
  drawScore();

  bird.velocityY += gravity;
  bird.y = Math.max(bird.y + bird.velocityY, 0);

  requestAnimationFrame(update);
}

function clearBoard() {
  context.clearRect(0, 0, boardWidth, boardHeight);
}

function drawBackground() {
  const background = new Image();
  background.src = "./flappybirdbg.png";
  context.drawImage(background, 0, 0, boardWidth, boardHeight);
}

function drawBird() {
  context.drawImage(bird.img, bird.x, bird.y, bird.width, bird.height);
}

function createPipe() {
  const randomPositionY = -pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  pipes.push(createPipeObject(topPipeImg, randomPositionY));
  pipes.push(createPipeObject(bottomPipeImg, randomPositionY + pipeHeight + pipeGap));
}

function createPipeObject(img, y) {
  return { img, x: boardWidth, y, width: pipeWidth, height: pipeHeight, passed: false };
}

function updatePipes() {
  pipes.forEach((pipe, index) => {
    pipe.x += velocityX;

    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      pipe.passed = true;
      score += 0.5;
    }

    if (detectCollision(pipe, bird)) {
      gameOver = true;
    }

    if (bird.y > boardHeight) {
      gameOver = true;
    }

    while (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.shift(); //removes first element from the array
    }
  });
}

function detectCollision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function moveBird(e) {
  if ((e.type === "keydown" && e.code === "Space") || e.type === "click") {
    bird.velocityY = -6;
  }
}

function drawScore() {
  context.fillStyle = "white";
  context.font = "24px Arial";
  context.fillText(`Score: ${score}`, 5, 30);
}

function updateBeforeStart() {
  if (started) return;

  clearBoard();
  context.fillStyle = "white";
  context.font = "30px Arial";
  context.fillText("Click Any Key to start", boardWidth / 8, boardHeight / 6);
  context.drawImage(bird.img, bird.x, bird.y, bird.width, bird.height);

  requestAnimationFrame(updateBeforeStart);
}

function gameOverUpdate() {
  started = false;
  clearBoard();
  displayGameOverText();

  if (!saved && score !== 0) {
    saveScore();
  }

  document.addEventListener("keydown", restartGame);
  document.addEventListener("click", restartGame);

  requestAnimationFrame(gameOverUpdate);
}

function displayGameOverText() {
  context.fillStyle = "white";
  context.font = "30px Arial";
  context.fillText("Game Over!", boardWidth / 8, boardHeight / 2);
  context.fillText(`Score: ${score}`, boardWidth / 8, boardHeight / 2 + 50);
  context.font = "18px Arial";
  context.fillText("Press any key to play again", boardWidth / 8, boardHeight / 2 + 100);
}

function saveScore() {
  saved = true;
  const name = prompt("By Which Name We Should Save Your Score?");
  if (name === null) {
    return; // Exit the function if the user cancels the prompt
  }
  const trimmedName = name.trim();
  let found = false;

  scores.forEach((scoreObj, i) => {
    const [storedName, storedScore] = Object.entries(scoreObj)[0];
    if (storedName === trimmedName) {
      found = true;
      if (storedScore < score) {
        scores[i][storedName] = score;
      }
    }
  });

  if (!found) {
    scores.push({ [trimmedName]: score });
  }

  localStorage.setItem("scores", JSON.stringify(scores));
  if (!found) {
    addToScoreBoard(trimmedName, score);
  }
}

function restartGame() {
  if (!reloaded) {
    reloaded = true;
    location.reload();
  }
}

function createScoreBoard() {
  scores.forEach((scoreObj) => {
    const [name, score] = Object.entries(scoreObj)[0];
    addToScoreBoard(name, score);
  });
}

function addToScoreBoard(name, score) {
  const tableRow = document.createElement("tr");
  const tableDataName = document.createElement("td");
  const tableDataScore = document.createElement("td");

  tableRow.append(tableDataName, tableDataScore);
  tableDataName.innerText = name;
  tableDataScore.innerText = score;

  document.getElementById("score-board").appendChild(tableRow);
}
