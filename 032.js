// Front-end JavaScript code
const speechRecognition = new webkitSpeechRecognition();
const speechSynthesis = window.speechSynthesis;
const socket = io();

// Set up speech recognition
speechRecognition.lang = 'en-US';
speechRecognition.maxResults = 10;
speechRecognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log(`Transcript: ${transcript}`);
  socket.emit('voice-command', transcript);
};

// Set up speech synthesis
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log(`Voices: ${voices}`);
};

// Set up voice command handler
socket.on('voice-command', (command) => {
  console.log(`Received voice command: ${command}`);
  // Handle voice command
  switch (command) {
    case 'turn on living room light':
      socket.emit('control-device', { device: 'living room light', action: 'turn on' });
      break;
    case 'turn off living room light':
      socket.emit('control-device', { device: 'living room light', action: 'turn off' });
      break;
    // Add more voice commands as needed
  }
});

// Set up device status update handler
socket.on('device-status', (status) => {
  console.log(`Received device status update: ${status}`);
  // Update front-end dashboard with device status
  const deviceStatusElement = document.getElementById('device-status');
  deviceStatusElement.innerHTML = `Device Status: ${status}`;
});

// Start speech recognition
speechRecognition.start();

// Front-end HTML code
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice-Controlled Smart Home Assistant</title>
  <style>
    #device-status {
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Voice-Controlled Smart Home Assistant</h1>
  <p id="device-status">Device Status: Unknown</p>
  <script src="https://cdn.jsdelivr.net/npm/socket.io@2.3.0/dist/socket.io.js"></script>
  <script src="script.js"></script>
</body>
</html>

// Back-end Node.js code (Node-RED)
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const NodeRED = require('node-red');

// Set up Node-RED
const nodeRed = new NodeRED({
  httpAdminRoot: '/red',
  httpNodeRoot: '/api',
  userDir: './node-red/',
  functionGlobalContext: {},
});

// Set up device control handler
io.on('control-device', (data) => {
  console.log(`Received device control command: ${data}`);
  // Control device using Node-RED
  nodeRed.nodes[data.device].send(data.action);
});

// Set up device status update handler
nodeRed.nodes['device-status'].on('input', (msg) => {
  console.log(`Received device status update: ${msg}`);
  // Send device status update to front-end
  io.emit('device-status', msg);
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});