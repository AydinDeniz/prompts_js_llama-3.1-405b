// Import necessary libraries
import axios from 'axios';
import { sortable } from 'sortablejs';

// Get the gallery container and input elements
const galleryContainer = document.getElementById('gallery-container');
const inputElement = document.getElementById('image-input');

// Initialize the gallery array
let gallery = [];

// Function to handle image upload
function handleImageUpload(event) {
  const files = event.target.files;
  const formData = new FormData();

  // Loop through the files and add them to the form data
  for (let i = 0; i < files.length; i++) {
    formData.append('images[]', files[i]);
  }

  // Send a request to the backend API to upload the images
  axios.post('/api/upload-images', formData)
    .then(response => {
      // Update the gallery array with the uploaded images
      gallery = response.data;

      // Render the gallery
      renderGallery();
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to render the gallery
function renderGallery() {
  // Clear the gallery container
  galleryContainer.innerHTML = '';

  // Loop through the gallery array and create an image element for each image
  gallery.forEach((image, index) => {
    const imageElement = document.createElement('img');
    imageElement.src = image.url;
    imageElement.alt = image.name;

    // Add the image element to the gallery container
    galleryContainer.appendChild(imageElement);
  });

  // Make the gallery sortable
  sortable(galleryContainer, {
    onEnd: (event) => {
      // Update the gallery array with the new order
      const newGallery = [];
      const imageElements = galleryContainer.children;
      for (let i = 0; i < imageElements.length; i++) {
        const imageElement = imageElements[i];
        const image = gallery.find(image => image.url === imageElement.src);
        newGallery.push(image);
      }
      gallery = newGallery;

      // Send a request to the backend API to update the image order
      axios.put('/api/update-image-order', gallery)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });
}

// Add an event listener to the input element to handle image upload
inputElement.addEventListener('change', handleImageUpload);

// Function to handle image preview
function handleImagePreview(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById('preview-container');

  // Clear the preview container
  previewContainer.innerHTML = '';

  // Loop through the files and create an image element for each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageElement = document.createElement('img');
      imageElement.src = event.target.result;
      imageElement.alt = file.name;

      // Add the image element to the preview container
      previewContainer.appendChild(imageElement);
    };
    reader.readAsDataURL(file);
  }
}

// Add an event listener to the input element to handle image preview
inputElement.addEventListener('change', handleImagePreview);

const express = require('express');
const multer = require('multer');
const app = express();

// Set up the database connection
const db = require('./db');

// Set up the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

// Set up the upload middleware
const upload = multer({ storage: storage });

// Route to upload images
app.post('/api/upload-images', upload.array('images[]', 12), (req, res) => {
  const images = req.files;

  // Loop through the images and save them to the database
  const gallery = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imageUrl = `uploads/${image.filename}`;
    const imageName = image.originalname;

    // Save the image to the database
    db.query(`INSERT INTO images (url, name) VALUES (?, ?)`, [imageUrl, imageName], (error, results) => {
      if (error) {
        console.error(error);
      } else {
        gallery.push({ url: imageUrl, name: imageName });
      }
    });
  }

  // Return the gallery array
  res.json(gallery);
});

// Route to update the image order
app.put('/api/update-image-order', (req, res) => {
  const gallery = req.body;

  // Loop through the gallery array and update the image order in the database
  for (let i = 0; i < gallery.length; i++) {
    const image = gallery[i];
    db.query(`UPDATE images SET order_index = ? WHERE url = ?`, [i, image.url], (error, results) => {
      if (error) {
        console.error(error);
      }
    });
  }

  // Return a success message
  res.json({ message: 'Image order updated successfully' });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});