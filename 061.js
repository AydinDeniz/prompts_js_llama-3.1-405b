// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { WebXR } = require('webxr');
const { THREE } = require('three');

// Create WebXR scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});

// Load 3D model
const loader = new THREE.GLTFLoader();
loader.load('model.gltf', (gltf) => {
  scene.add(gltf.scene);
});

// Define WebXR session
let xrSession;
navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['local-floor', 'bounded-floor', 'plane-detection', 'prismatic-form'],
  optionalFeatures: ['prismatic-form'],
})
.then((session) => {
  xrSession = session;
  session.addEventListener('end', (event) => {
    xrSession = null;
  });
})
.catch((error) => {
  console.error(error);
});

// Define WebXR frame callback
function onXRFrame(timestamp, frame) {
  if (xrSession) {
    const pose = frame.getViewerPose();
    if (pose) {
      camera.position.copy(pose.transform.position);
      camera.quaternion.copy(pose.transform.orientation);
    }
  }
}

// Define real-time scaling and positioning
function onScale(event) {
  const scale = event.scale;
  scene.scale.set(scale, scale, scale);
}

function onPosition(event) {
  const position = event.position;
  scene.position.copy(position);
}

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

  socket.on('get-model', () => {
    loader.load('model.gltf', (gltf) => {
      socket.emit('model', gltf.scene);
    });
  });

  socket.on('scale-model', (scale) => {
    onScale({ scale });
  });

  socket.on('position-model', (position) => {
    onPosition({ position });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Render WebXR scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();