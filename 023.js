// Import required libraries
const express = require('express');
const app = express();
const multer = require('multer');
const Three = require('three');
const OrbitControls = require('three/examples/js/controls/OrbitControls');
const VRControls = require('three/examples/js/controls/VRControls');
const VRButton = require('three/examples/js/webxr/VRButton');
const MongoDB = require('mongodb');

// Set up MongoDB database connection
const MongoClient = MongoDB.MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'virtualRealityTours';

// Set up Express.js server
app.use(express.static('public'));

// Set up Multer for image uploads
const upload = multer({ dest: './uploads/' });

// Set up Three.js scene
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
const vrControls = new VRControls(camera, renderer.domElement);
const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

// Function to upload 360-degree images
app.post('/upload-image', upload.single('image'), (req, res) => {
  const image = req.file;
  const tourId = req.body.tourId;
  const sceneId = req.body.sceneId;

  // Save the image to the MongoDB database
  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.error(err);
    } else {
      const db = client.db(dbName);
      const collection = db.collection('tours');
      collection.updateOne({ _id: tourId }, { $push: { scenes: { _id: sceneId, image: image.filename } } }, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Image uploaded successfully');
          res.send({ message: 'Image uploaded successfully' });
        }
      });
    }
  });
});

// Function to add hotspots with descriptions
app.post('/add-hotspot', (req, res) => {
  const tourId = req.body.tourId;
  const sceneId = req.body.sceneId;
  const hotspot = req.body.hotspot;

  // Save the hotspot to the MongoDB database
  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.error(err);
    } else {
      const db = client.db(dbName);
      const collection = db.collection('tours');
      collection.updateOne({ _id: tourId }, { $push: { scenes: { _id: sceneId, hotspots: hotspot } } }, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Hotspot added successfully');
          res.send({ message: 'Hotspot added successfully' });
        }
      });
    }
  });
});

// Function to transition between scenes
app.post('/transition-scene', (req, res) => {
  const tourId = req.body.tourId;
  const sceneId = req.body.sceneId;

  // Get the scene data from the MongoDB database
  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.error(err);
    } else {
      const db = client.db(dbName);
      const collection = db.collection('tours');
      collection.findOne({ _id: tourId }, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          const scene = result.scenes.find((scene) => scene._id === sceneId);
          if (scene) {
            // Transition to the new scene
            camera.position.x = scene.position.x;
            camera.position.y = scene.position.y;
            camera.position.z = scene.position.z;
            controls.target.x = scene.target.x;
            controls.target.y = scene.target.y;
            controls.target.z = scene.target.z;
            vrControls.resetPose();
            res.send({ message: 'Scene transitioned successfully' });
          } else {
            res.send({ message: 'Scene not found' });
          }
        }
      });
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
// Front-end JavaScript code
const canvas = document.getElementById('canvas');
const sceneSelect = document.getElementById('scene-select');
const hotspotForm = document.getElementById('hotspot-form');
const transitionButton = document.getElementById('transition-button');

// Set up Three.js scene
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
const vrControls = new VRControls(camera, renderer.domElement);
const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

// Function to upload 360-degree images
function uploadImage(image) {
  const formData = new FormData();
  formData.append('image', image);
  fetch('/upload-image', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
}

// Function to add hotspots with descriptions
function addHotspot(hotspot) {
  fetch('/add-hotspot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hotspot),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
}

// Function to transition between scenes
function transitionScene(sceneId) {
  fetch('/transition-scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
}

// Set up event listeners
canvas.addEventListener('click', (e) => {
  const image = e.target.files[0];
  uploadImage(image);
});

hotspotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const hotspot = {
    position: {
      x: parseFloat(hotspotForm.positionX.value),
      y: parseFloat(hotspotForm.positionY.value),
      z: parseFloat(hotspotForm.positionZ.value),
    },
    target: {
      x: parseFloat(hotspotForm.targetX.value),
      y: parseFloat(hotspotForm.targetY.value),
      z: parseFloat(hotspotForm.targetZ.value),
    },
    description: hotspotForm.description.value,
  };
  addHotspot(hotspot);
});

transitionButton.addEventListener('click', (e) => {
  e.preventDefault();
  const sceneId = sceneSelect.value;
  transitionScene(sceneId);
});