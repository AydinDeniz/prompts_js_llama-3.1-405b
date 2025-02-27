const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Define the user model
const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
});

// Create an express router
const router = express.Router();

// Define the API endpoint to update user profile information
router.post('/update-profile', authenticateToken, async (req, res) => {
  try {
    // Get the user ID from the request token
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Sanitize the input data
    const name = req.body.name.trim();
    const email = req.body.email.trim();

    // Validate the input data
    if (!name || !email) {
      return res.status(400).send({ message: 'Invalid input data' });
    }

    // Check if the email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).send({ message: 'Email already taken' });
    }

    // Update the user profile information
    user.name = name;
    user.email = email;

    // Save the changes
    await user.save();

    // Return a success response
    res.send({ message: 'Profile updated successfully' });
  } catch (error) {
    // Return an error response
    res.status(500).send({ message: 'Error updating profile' });
  }
});

// Define the middleware to authenticate the request token
function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers['authorization'];

  // Check if the authorization header exists
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  // Extract the token from the authorization header
  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Invalid token' });
    }

    // Add the user to the request object
    req.user = user;

    // Call the next middleware
    next();
  });
}

// Define the middleware to hash the user password
async function hashPassword(req, res, next) {
  // Get the user password
  const password = req.body.password;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add the hashed password to the request object
  req.body.password = hashedPassword;

  // Call the next middleware
  next();
}

// Define the middleware to verify the user password
async function verifyPassword(req, res, next) {
  // Get the user ID and password
  const userId = req.user.id;
  const password = req.body.password;

  // Find the user by ID
  const user = await User.findById(userId);

  // Check if the user exists
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  // Verify the password
  const isValidPassword = await bcrypt.compare(password, user.password);

  // Check if the password is valid
  if (!isValidPassword) {
    return res.status(401).send({ message: 'Invalid password' });
  }

  // Call the next middleware
  next();
}