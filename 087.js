const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up the express app
const app = express();

// Set up the upload directory
const uploadDir = path.join(__dirname, 'uploads');

// Create the upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up the multer middleware
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter(req, file, cb) {
    const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.doc'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedFileTypes.includes(fileExtension)) {
      return cb(new Error('File type not supported'));
    }

    cb(null, true);
  },
});

// Set up the upload route
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Get the uploaded file
    const file = req.file;

    // Get the file metadata
    const fileMetadata = {
      filename: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
    };

    // Store the file metadata in a database or cache layer
    // For this example, we'll just log it to the console
    console.log(fileMetadata);

    // Return a success response
    res.status(201).send({ message: 'File uploaded successfully' });
  } catch (error) {
    // Return an error response
    res.status(500).send({ message: 'Error uploading file' });
  }
});

// Set up the error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send({ message: err.message });
  } else {
    next(err);
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});