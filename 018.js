// Front-end JavaScript code
const videoInput = document.getElementById('video-input');
const videoPreview = document.getElementById('video-preview');
const uploadButton = document.getElementById('upload-button');
const progressBar = document.getElementById('progress-bar');
const uploadStatus = document.getElementById('upload-status');

// Select and preview video
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    videoPreview.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// Upload video
uploadButton.addEventListener('click', (e) => {
  e.preventDefault();
  const file = videoInput.files[0];
  const formData = new FormData();
  formData.append('video', file);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      uploadStatus.textContent = 'Upload complete!';
    })
    .catch((err) => console.error(err));

  // Display upload progress
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    progressBar.style.width = `${percent}%`;
    uploadStatus.textContent = `Uploading... ${percent}%`;
  });
  xhr.upload.addEventListener('load', () => {
    uploadStatus.textContent = 'Upload complete!';
  });
  xhr.upload.addEventListener('error', () => {
    uploadStatus.textContent = 'Upload failed!';
  });
  xhr.open('POST', '/upload', true);
  xhr.send(formData);
});

// Back-end Node.js code
const express = require('express');
const app = express();
const multer = require('multer');
const AWS = require('aws-sdk');
const mongoose = require('mongoose');

// Set up MongoDB connection
mongoose.connect('mongodb://localhost/video-upload', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up AWS S3 connection
const s3 = new AWS.S3({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
});

// Set up video upload middleware
const upload = multer({
  dest: './uploads/',
});

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
  const file = req.file;
  const videoMetadata = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
  };

  // Store video metadata in MongoDB
  const video = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
  });
  const Video = mongoose.model('Video', video);
  const newVideo = new Video(videoMetadata);
  newVideo.save((err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Video metadata saved to MongoDB');
    }
  });

  // Upload video to AWS S3
  const params = {
    Bucket: 'your-bucket-name',
    Key: file.originalname,
    Body: file.buffer,
  };
  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Video uploaded to AWS S3');
      res.json({ message: 'Video uploaded successfully' });
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Back-end Node.js code
const express = require('express');
const app = express();
const pg = require('pg');
const bodyParser = require('body-parser');

// Set up PostgreSQL database connection
const db = new pg.Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error('connection error', err);
  } else {
    console.log('connected');
  }
});

// Set up Express.js server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle appointment creation
app.post('/appointments', (req, res) => {
  const { name, email, date, time } = req.body;

  // Validate user inputs
  if (!name || !email || !date || !time) {
    res.status(400).send({ message: 'Please fill in all fields' });
    return;
  }

  // Insert appointment into PostgreSQL database
  const query = {
    text: `INSERT INTO appointments (name, email, date, time) VALUES ($1, $2, $3, $4) RETURNING *`,
    values: [name, email, date, time],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error creating appointment' });
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Handle appointment retrieval
app.get('/appointments', (req, res) => {
  const query = {
    text: 'SELECT * FROM appointments',
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error retrieving appointments' });
    } else {
      res.send(result.rows);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});