const game = document.getElementById("game");
const duck = document.getElementById("duck");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const messageEl = document.getElementById("message");

let duckBottom = 3;
let velocity = 0;
let gravity = 0.9;
let jumpStrength = 14;
let isJumping = false;
let isGameOver = false;
let gameStarted = false;
let score = 0;
let speed = 6;
let speedMultiplier = 1;
let frameId;
let obstacleTimer;
let scoreTimer;
let speedTimer;
let obstacles = [];

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  isGameOver = false;
  messageEl.textContent = "";
  update();

  obstacleTimer = setInterval(createObstacle, 1400);

  scoreTimer = setInterval(() => {
    if (!isGameOver) {
      score++;
      scoreEl.textContent = score;
    }
  }, 100);

  speedTimer = setInterval(() => {
    if (!isGameOver) {
      speed += 0.35;
      speedMultiplier = speed / 6;
      speedEl.textContent = "Velocidad: " + speedMultiplier.toFixed(1) + "x";
    }
  }, 2500);
}

function jump() {
  if (!gameStarted) startGame();
  if (isJumping || isGameOver) return;

  isJumping = true;
  velocity = jumpStrength;
  duck.classList.add("jumping");
}

function update() {
  frameId = requestAnimationFrame(update);

  if (isJumping) {
    duckBottom += velocity;
    velocity -= gravity;

    if (duckBottom <= 3) {
      duckBottom = 3;
      isJumping = false;
      velocity = 0;
      duck.classList.remove("jumping");
    }
  }

  duck.style.bottom = duckBottom + "px";

  moveObstacles();
  checkCollision();
}

function createObstacle() {
  if (isGameOver) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.left = game.clientWidth + "px";
  game.appendChild(obstacle);
  obstacles.push(obstacle);
}

function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    let left = parseFloat(obstacle.style.left);
    left -= speed;
    obstacle.style.left = left + "px";

    if (left < -50) {
      obstacle.remove();
      obstacles.splice(index, 1);
    }
  });
}

function checkCollision() {
  const duckRect = duck.getBoundingClientRect();

  for (const obstacle of obstacles) {
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      duckRect.left < obstacleRect.right &&
      duckRect.right > obstacleRect.left &&
      duckRect.top < obstacleRect.bottom &&
      duckRect.bottom > obstacleRect.top
    ) {
      gameOver();
      break;
    }
  }
}

function gameOver() {
  isGameOver = true;
  cancelAnimationFrame(frameId);
  clearInterval(obstacleTimer);
  clearInterval(scoreTimer);
  clearInterval(speedTimer);
  messageEl.innerHTML = "Perdiste<br>Presiona R para reiniciar";
}

function resetGame() {
  cancelAnimationFrame(frameId);
  clearInterval(obstacleTimer);
  clearInterval(scoreTimer);
  clearInterval(speedTimer);

  obstacles.forEach((obstacle) => obstacle.remove());
  obstacles = [];

  duckBottom = 3;
  velocity = 0;
  isJumping = false;
  isGameOver = false;
  gameStarted = false;
  score = 0;
  speed = 6;
  speedMultiplier = 1;

  duck.style.bottom = "3px";
  duck.classList.remove("jumping");
  scoreEl.textContent = "0";
  speedEl.textContent = "Velocidad: 1.0x";
  messageEl.textContent = "Presiona ESPACIO para iniciar";
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }

  if (e.key.toLowerCase() === "r") {
    resetGame();
  }
});