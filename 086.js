const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Define the secret key for signing and verifying tokens
const secretKey = 'your_secret_key_here';

// Define the token expiration time in seconds
const tokenExpirationTime = 60 * 60 * 24 * 7; // 1 week

// Function to generate a new token
function generateToken(user) {
  const token = jwt.sign({
    userId: user.id,
    username: user.username,
  }, secretKey, {
    expiresIn: tokenExpirationTime,
  });

  return token;
}

// Function to verify a token
function verifyToken(token) {
  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

// Function to store the token in the browser's local storage
function storeToken(token) {
  localStorage.setItem('token', token);
}

// Function to retrieve the token from the browser's local storage
function retrieveToken() {
  return localStorage.getItem('token');
}

// Function to delete the token from the browser's local storage
function deleteToken() {
  localStorage.removeItem('token');
}

// Function to re-authenticate the user when the token expires
function reAuthenticateUser() {
  const token = retrieveToken();

  if (!token) {
    return null;
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    deleteToken();
    return null;
  }

  // Re-authenticate the user using the decoded token
  const user = {
    id: decodedToken.userId,
    username: decodedToken.username,
  };

  const newToken = generateToken(user);
  storeToken(newToken);

  return user;
}

// Function to handle token expiration
function handleTokenExpiration() {
  const token = retrieveToken();

  if (!token) {
    return;
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    deleteToken();
    return;
  }

  const tokenExpirationDate = new Date(decodedToken.exp * 1000);

  if (tokenExpirationDate < new Date()) {
    reAuthenticateUser();
  }
}

// Set up an interval to handle token expiration every hour
setInterval(handleTokenExpiration, 60 * 60 * 1000);

// Example usage:
const user = {
  id: 1,
  username: 'johnDoe',
};

const token = generateToken(user);
storeToken(token);

// Later, when the token expires...
const reAuthenticatedUser = reAuthenticateUser();
console.log(reAuthenticatedUser);