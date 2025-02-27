// Import required libraries
const { Board, Servos, Motors } = require('johnny-five');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Define robot hardware components
const board = new Board();
const servos = new Servos([
  { pin: 3, range: [0, 180] },
  { pin: 5, range: [0, 180] },
  { pin: 6, range: [0, 180] },
]);
const motors = new Motors([
  { pins: { pwm: 3, dir: 4 } },
  { pins: { pwm: 5, dir: 6 } },
]);

// Define robot actions and behaviors
const actions = {
  forward: () => {
    motors[0].forward(100);
    motors[1].forward(100);
  },
  backward: () => {
    motors[0].reverse(100);
    motors[1].reverse(100);
  },
  left: () => {
    motors[0].forward(50);
    motors[1].reverse(50);
  },
  right: () => {
    motors[0].reverse(50);
    motors[1].forward(50);
  },
  stop: () => {
    motors[0].stop();
    motors[1].stop();
  },
};

// Define visual programming interface
const blocks = [
  {
    id: 'forward',
    text: 'Forward',
    action: actions.forward,
  },
  {
    id: 'backward',
    text: 'Backward',
    action: actions.backward,
  },
  {
    id: 'left',
    text: 'Left',
    action: actions.left,
  },
  {
    id: 'right',
    text: 'Right',
    action: actions.right,
  },
  {
    id: 'stop',
    text: 'Stop',
    action: actions.stop,
  },
];

// Create web interface
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle remote control commands
io.on('connection', (socket) => {
  socket.on('command', (command) => {
    const block = blocks.find((block) => block.id === command);
    if (block) {
      block.action();
    }
  });
});

// Start server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Initialize robot hardware components
board.on('ready', () => {
  servos.center();
  motors.stop();
});