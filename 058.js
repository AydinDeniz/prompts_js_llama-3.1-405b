// Import required libraries
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const socket = io();

// Define game variables
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: 5,
  score: 0,
};

let enemies = [];
let bullets = [];
let level = 1;

// Define game mechanics
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.x += player.speed;
  if (player.x < 0 || player.x > canvas.width) {
    player.speed = -player.speed;
  }
  enemies.forEach((enemy) => {
    enemy.x += enemy.speed;
    if (enemy.x < 0 || enemy.x > canvas.width) {
      enemy.speed = -enemy.speed;
    }
    if (checkCollision(player, enemy)) {
      player.score -= 10;
    }
  });
  bullets.forEach((bullet) => {
    bullet.x += bullet.speed;
    if (bullet.x < 0 || bullet.x > canvas.width) {
      bullets.splice(bullets.indexOf(bullet), 1);
    }
    enemies.forEach((enemy) => {
      if (checkCollision(bullet, enemy)) {
        enemies.splice(enemies.indexOf(enemy), 1);
        bullets.splice(bullets.indexOf(bullet), 1);
        player.score += 10;
      }
    });
  });
  ctx.fillStyle = 'black';
  ctx.fillRect(player.x, player.y, 20, 20);
  enemies.forEach((enemy) => {
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, 20, 20);
  });
  bullets.forEach((bullet) => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(bullet.x, bullet.y, 10, 10);
  });
  ctx.font = '24px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${player.score}`, 10, 10);
  ctx.fillText(`Level: ${level}`, 10, 40);
}

function checkCollision(obj1, obj2) {
  if (obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y) {
    return true;
  }
  return false;
}

// Handle user input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    player.speed = -5;
  } else if (e.key === 'ArrowRight') {
    player.speed = 5;
  } else if (e.key === ' ') {
    const bullet = {
      x: player.x,
      y: player.y,
      speed: 10,
    };
    bullets.push(bullet);
  }
});

// Handle socket.io events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('level-up', () => {
  level++;
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: Math.random() * 5,
  });
});

// Start game loop
setInterval(update, 1000 / 60);