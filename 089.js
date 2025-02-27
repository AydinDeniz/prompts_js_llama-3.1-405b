const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store active connections
const connections = new Map();

// Handle new connections
wss.on('connection', (ws) => {
  // Generate a unique ID for the connection
  const id = Math.random().toString(36).substr(2, 9);

  // Store the connection
  connections.set(id, ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    // Broadcast the message to all active connections
    connections.forEach((connection) => {
      connection.send(message);
    });
  });

  // Handle connection close
  ws.on('close', () => {
    // Remove the connection from the store
    connections.delete(id);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('Error occurred:', error);
  });
});

// Set up a secure connection using SSL/TLS
const fs = require('fs');
const https = require('https');
const sslOptions = {
  key: fs.readFileSync('path/to/ssl/key'),
  cert: fs.readFileSync('path/to/ssl/cert'),
};

const httpsServer = https.createServer(sslOptions, (req, res) => {
  // Handle HTTPS requests
});

const wssSecure = new WebSocket.Server({ server: httpsServer });

// Handle secure connections
wssSecure.on('connection', (ws) => {
  // Handle secure connections similarly to the non-secure connections
});

// Start the HTTPS server
httpsServer.listen(8081, () => {
  console.log('Secure WebSocket server listening on port 8081');
});

const socket = new WebSocket('ws://localhost:8080');

// Handle incoming messages
socket.onmessage = (event) => {
  console.log(`Received message: ${event.data}`);
};

// Handle connection open
socket.onopen = () => {
  console.log('Connected to the WebSocket server');
};

// Handle connection close
socket.onclose = () => {
  console.log('Disconnected from the WebSocket server');
};

// Handle errors
socket.onerror = (error) => {
  console.error('Error occurred:', error);
};

// Send a message to the server
socket.send('Hello, server!');

const socket = new WebSocket('wss://localhost:8081');