const game = document.getElementById("game");
const duck = document.getElementById("duck");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const highScoreEl = document.getElementById("highScore");
const messageEl = document.getElementById("message");
const cloudsContainer = document.getElementById("clouds");
const resetHighScoreBtn = document.getElementById("resetHighScoreBtn");

let duckBottom = 3;
let velocity = 0;
let gravity = 0.9;
let jumpStrength = 14;

let isJumping = false;
let isGameOver = false;
let gameStarted = false;
let isDucking = false;

let score = 0;
let speed = 6;
let speedMultiplier = 1;

let frameId;
let scoreTimer;
let speedTimer;
let spawnTimeout;

let obstacles = [];
let clouds = [];

const MIN_GAP = 260;
const HIGH_SCORE_KEY = "jumpDuckHighScore";

let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
highScoreEl.textContent = "Récord: " + highScore;

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  isGameOver = false;
  messageEl.textContent = "";

  update();
  scheduleNextSpawn();

  scoreTimer = setInterval(() => {
    if (!isGameOver) {
      score++;
      scoreEl.textContent = score;
      updateHighScore();
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

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    highScoreEl.textContent = "Récord: " + highScore;
  }
}

function resetHighScore() {
  highScore = 0;
  localStorage.removeItem(HIGH_SCORE_KEY);
  highScoreEl.textContent = "Récord: 0";
}

function jump() {
  if (!gameStarted) startGame();
  if (isJumping || isGameOver) return;

  isJumping = true;
  velocity = jumpStrength;
  duck.classList.add("jumping");
}

function duckDown() {
  if (!gameStarted) startGame();
  if (isJumping || isGameOver) return;

  isDucking = true;
  duck.classList.add("ducking");
}

function duckUp() {
  isDucking = false;
  duck.classList.remove("ducking");
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
  moveClouds();
  checkCollision();
}

function scheduleNextSpawn() {
  if (isGameOver) return;

  const delay = Math.max(900, 1500 - speed * 35);

  spawnTimeout = setTimeout(() => {
    spawnEntity();
    scheduleNextSpawn();
  }, delay);
}

function spawnEntity() {
  if (isGameOver) return;
  if (!isSpawnZoneFree()) return;

  const type = Math.random() < 0.7 ? "obstacle" : "cloud";

  if (type === "obstacle") {
    createObstacle();
  } else {
    createCloud();
  }
}

function isSpawnZoneFree() {
  const allEntities = [...obstacles, ...clouds];

  if (allEntities.length === 0) return true;

  let rightMost = 0;

  for (const entity of allEntities) {
    const left = parseFloat(entity.style.left);
    if (left > rightMost) {
      rightMost = left;
    }
  }

  return rightMost < game.clientWidth - MIN_GAP;
}

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.left = game.clientWidth + "px";
  game.appendChild(obstacle);
  obstacles.push(obstacle);
}

function createCloud() {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");
  cloud.style.left = game.clientWidth + "px";

  // Ajusta este valor si quieres bajar o subir la nube
  cloud.style.top = "150px";

  cloudsContainer.appendChild(cloud);
  clouds.push(cloud);
}

function moveObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    let left = parseFloat(obstacle.style.left);
    left -= speed;
    obstacle.style.left = left + "px";

    if (left < -60) {
      obstacle.remove();
      obstacles.splice(i, 1);
    }
  }
}

function moveClouds() {
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    let left = parseFloat(cloud.style.left);
    left -= speed;
    cloud.style.left = left + "px";

    if (left < -120) {
      cloud.remove();
      clouds.splice(i, 1);
    }
  }
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
      return;
    }
  }

  for (const cloud of clouds) {
    const cloudRect = cloud.getBoundingClientRect();

    if (
      duckRect.left < cloudRect.right &&
      duckRect.right > cloudRect.left &&
      duckRect.top < cloudRect.bottom &&
      duckRect.bottom > cloudRect.top &&
      !isDucking
    ) {
      gameOver();
      return;
    }
  }
}

function gameOver() {
  isGameOver = true;
  updateHighScore();
  cancelAnimationFrame(frameId);
  clearInterval(scoreTimer);
  clearInterval(speedTimer);
  clearTimeout(spawnTimeout);
  messageEl.innerHTML = "Perdiste<br>Presiona R para reiniciar";
}

function resetGame() {
  cancelAnimationFrame(frameId);
  clearInterval(scoreTimer);
  clearInterval(speedTimer);
  clearTimeout(spawnTimeout);

  obstacles.forEach((obstacle) => obstacle.remove());
  clouds.forEach((cloud) => cloud.remove());

  obstacles = [];
  clouds = [];

  duckBottom = 3;
  velocity = 0;
  isJumping = false;
  isGameOver = false;
  gameStarted = false;
  isDucking = false;
  score = 0;
  speed = 6;
  speedMultiplier = 1;

  duck.style.bottom = "3px";
  duck.classList.remove("jumping");
  duck.classList.remove("ducking");

  scoreEl.textContent = "0";
  speedEl.textContent = "Velocidad: 1.0x";
  highScoreEl.textContent = "Récord: " + highScore;
  messageEl.textContent = "Presiona ESPACIO para iniciar";
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }

  if (e.code === "ArrowDown") {
    e.preventDefault();
    duckDown();
  }

  if (e.key.toLowerCase() === "r") {
    resetGame();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    duckUp();
  }
});

resetHighScoreBtn.addEventListener("click", () => {
  resetHighScore();
});