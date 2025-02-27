// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Matchmaking } = require('matchmaking');

// Define game mechanics
class Game {
  constructor() {
    this.players = [];
    this.leaderboard = {};
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  updateLeaderboard() {
    this.leaderboard = this.players.sort((a, b) => b.score - a.score);
  }

  matchmake() {
    const matchmaking = new Matchmaking();
    const matches = matchmaking.matchmake(this.players);
    return matches;
  }
}

// Define player class
class Player {
  constructor(id, name, score) {
    this.id = id;
    this.name = name;
    this.score = score;
  }
}

// Create game instance
const game = new Game();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Handle incoming Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('join-game', (player) => {
    game.addPlayer(new Player(socket.id, player.name, 0));
    socket.emit('joined-game', game.leaderboard);
  });

  socket.on('leave-game', () => {
    game.removePlayer(socket.id);
    socket.emit('left-game');
  });

  socket.on('update-score', (score) => {
    const player = game.players.find((player) => player.id === socket.id);
    player.score = score;
    game.updateLeaderboard();
    socket.emit('updated-leaderboard', game.leaderboard);
  });

  socket.on('matchmake', () => {
    const matches = game.matchmake();
    socket.emit('matches', matches);
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});