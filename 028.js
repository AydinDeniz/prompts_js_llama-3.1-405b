// Front-end JavaScript code
const xrButton = document.getElementById('xr-button');
const xrScene = document.getElementById('xr-scene');
const productSelect = document.getElementById('product-select');

// Set up WebXR API
const xrSession = await navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['local-floor', 'bounded-floor', 'plane-detection', 'prismatic-form'],
  optionalFeatures: ['prismatic-form'],
});

// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: xrScene,
  antialias: true,
});

// Set up product models
const productModels = {};
productSelect.addEventListener('change', (e) => {
  const productId = e.target.value;
  const productModel = productModels[productId];
  if (productModel) {
    scene.add(productModel);
  }
});

// Set up XR session
xrSession.addEventListener('end', (e) => {
  console.log('XR session ended');
});

xrSession.addEventListener('select', (e) => {
  const productId = productSelect.value;
  const productModel = productModels[productId];
  if (productModel) {
    const raycaster = new THREE.Raycaster();
    const intersects = raycaster.intersectObject(productModel);
    if (intersects.length > 0) {
      const intersection = intersects[0];
      const position = intersection.point;
      productModel.position.copy(position);
    }
  }
});

// Set up product management
async function loadProducts() {
  const response = await fetch('/products');
  const products = await response.json();
  products.forEach((product) => {
    const productModel = new THREE.Mesh(
      new THREE.BoxGeometry(product.width, product.height, product.depth),
      new THREE.MeshBasicMaterial({ color: product.color }),
    );
    productModels[product.id] = productModel;
  });
}

// Start the XR session
xrButton.addEventListener('click', async () => {
  await xrSession.start();
  loadProducts();
});

// Back-end JavaScript code (Express.js)
const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Set up MongoDB connection
mongoose.connect('mongodb://localhost/products', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up product model
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  width: Number,
  height: Number,
  depth: Number,
  color: String,
});
const Product = mongoose.model('Product', productSchema);

// Set up product routes
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});