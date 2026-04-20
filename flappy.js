const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

const bird = {
  x: 90,
  y: canvas.height / 2,
  radius: 14,
  velocity: 0
};

const gravity = 0.45;
const flapForce = -7.5;
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 2.6;
const pipeInterval = 95;

let frame = 0;
let score = 0;
let bestScore = 0;
let gameOver = false;
let pipes = [];

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  frame = 0;
  score = 0;
  gameOver = false;
  pipes = [];
  draw();
}

function flap() {
  if (gameOver) {
    return;
  }
  bird.velocity = flapForce;
}

function createPipe() {
  const minTop = 70;
  const maxTop = canvas.height - pipeGap - 110;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  pipes.push({
    x: canvas.width,
    topHeight,
    passed: false
  });
}

function update() {
  if (gameOver) {
    return;
  }

  frame += 1;
  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (frame % pipeInterval === 0) {
    createPipe();
  }

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score += 1;
      bestScore = Math.max(bestScore, score);
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > -5);

  if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
    gameOver = true;
  }

  for (const pipe of pipes) {
    const inPipeX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth;
    const hitsTop = bird.y - bird.radius < pipe.topHeight;
    const hitsBottom = bird.y + bird.radius > pipe.topHeight + pipeGap;
    if (inPipeX && (hitsTop || hitsBottom)) {
      gameOver = true;
      break;
    }
  }
}

function drawBackground() {
  ctx.fillStyle = '#7ed2ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#89d87f';
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
}

function drawBird() {
  ctx.beginPath();
  ctx.fillStyle = '#ffd54d';
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = '#ff8f00';
  ctx.arc(bird.x + 12, bird.y + 1, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = '#1d1d1d';
  ctx.arc(bird.x + 5, bird.y - 5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawPipes() {
  ctx.fillStyle = '#22b24b';
  pipes.forEach((pipe) => {
    const bottomY = pipe.topHeight + pipeGap;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillRect(pipe.x - 4, pipe.topHeight - 18, pipeWidth + 8, 18);
    ctx.fillRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY);
    ctx.fillRect(pipe.x - 4, bottomY, pipeWidth + 8, 18);
  });
}

function drawScore() {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`${score}`, canvas.width / 2 - 8, 50);

  ctx.font = '16px Arial';
  ctx.fillText(`Best: ${bestScore}`, 15, 30);
}

function drawGameOver() {
  if (!gameOver) {
    return;
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 15);
  ctx.font = '18px Arial';
  ctx.fillText('Press Restart or Space', canvas.width / 2, canvas.height / 2 + 25);
  ctx.textAlign = 'start';
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawScore();
  drawGameOver();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (gameOver) {
      resetGame();
      flap();
      return;
    }
    flap();
  }
});

canvas.addEventListener('pointerdown', () => {
  if (gameOver) {
    resetGame();
  }
  flap();
});

restartBtn.addEventListener('click', () => {
  resetGame();
});

resetGame();
loop();
