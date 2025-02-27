// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let activeUsers = [];

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const { type, data } = JSON.parse(message);

    if (type === 'join') {
      activeUsers.push(data.username);
      broadcastMessage(`User ${data.username} joined the chat`, ws);
    } else if (type === 'message') {
      broadcastMessage(`${data.username}: ${data.message}`, ws);
    } else if (type === 'leave') {
      activeUsers = activeUsers.filter((user) => user !== data.username);
      broadcastMessage(`User ${data.username} left the chat`, ws);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcastMessage(message, senderWs) {
  wss.clients.forEach((client) => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'message', data: message }));
    }
  });
}

// client.js
const socket = new WebSocket('ws://localhost:8080');

const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const joinButton = document.getElementById('join');
const sendMessageButton = document.getElementById('send-message');
const chatLog = document.getElementById('chat-log');

joinButton.addEventListener('click', () => {
  const username = usernameInput.value;
  socket.send(JSON.stringify({ type: 'join', data: { username } }));
});

sendMessageButton.addEventListener('click', () => {
  const message = messageInput.value;
  const username = usernameInput.value;
  socket.send(JSON.stringify({ type: 'message', data: { username, message } }));
});

socket.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'message') {
    const messageElement = document.createElement('p');
    messageElement.textContent = data;
    chatLog.appendChild(messageElement);
  }
};

socket.onclose = () => {
  console.log('Connection closed');
};

socket.onerror = (error) => {
  console.log('Error occurred:', error);
};