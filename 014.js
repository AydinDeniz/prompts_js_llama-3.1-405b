// Import required libraries
const firebase = require('firebase/app');
const firebaseFirestore = require('firebase/firestore');
const WebSocket = require('ws');

// Initialize Firebase
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
});

// Set up Firebase Firestore
const db = firebaseFirestore();

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store the current document state
let documentState = '';

// Store the user permissions
const userPermissions = {};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Handle incoming messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const userId = data.userId;
    const operation = data.operation;

    // Check user permissions
    if (!userPermissions[userId] || !userPermissions[userId].includes(operation)) {
      ws.send(JSON.stringify({ error: 'Permission denied' }));
      return;
    }

    // Apply the operation to the document state
    switch (operation) {
      case 'insert':
        documentState = documentState.substring(0, data.position) + data.text + documentState.substring(data.position);
        break;
      case 'delete':
        documentState = documentState.substring(0, data.position) + documentState.substring(data.position + data.length);
        break;
      default:
        ws.send(JSON.stringify({ error: 'Invalid operation' }));
        return;
    }

    // Broadcast the updated document state to all clients
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ documentState }));
    });

    // Save the updated document state to Firebase Firestore
    db.collection('documents').doc('current').set({ state: documentState });
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('Error occurred:', error);
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Load the initial document state from Firebase Firestore
db.collection('documents').doc('current').get().then((doc) => {
  if (doc.exists) {
    documentState = doc.data().state;
  }
});

// Load user permissions from Firebase Firestore
db.collection('permissions').get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    const userId = doc.id;
    const permissions = doc.data().permissions;
    userPermissions[userId] = permissions;
  });
});

// Client-side JavaScript code
const socket = new WebSocket('ws://localhost:8080');

// Set up the text editor
const textEditor = document.getElementById('text-editor');

// Handle changes to the text editor
textEditor.addEventListener('input', () => {
  const text = textEditor.value;
  const operation = getOperation(text);
  socket.send(JSON.stringify({ operation }));
});

// Get the operation (insert or delete) based on the text change
function getOperation(text) {
  const previousText = textEditor.previousValue;
  const position = textEditor.selectionStart;
  const length = text.length - previousText.length;

  if (length > 0) {
    return { operation: 'insert', position, text: text.substring(position, position + length) };
  } else {
    return { operation: 'delete', position, length: -length };
  }
}

// Handle incoming messages from the server
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.documentState) {
    textEditor.value = data.documentState;
  } else if (data.error) {
    console.error('Error occurred:', data.error);
  }
};

// Handle errors
socket.onerror = (error) => {
  console.error('Error occurred:', error);
};

// Handle disconnections
socket.onclose = () => {
  console.log('Disconnected from the server');
};