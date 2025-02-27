const fs = require('fs');
const crypto = require('crypto');

// Define the path to the JSON file that stores user credentials
const credentialsFile = 'credentials.json';

// Initialize the credentials object
let credentials = {};

// Load existing credentials from the JSON file
if (fs.existsSync(credentialsFile)) {
  credentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
}

// Function to hash a password using SHA-256
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt);
  hash.update(password);
  return `${salt}:${hash.digest('hex')}`;
}

// Function to verify a password against a stored hash
function verifyPassword(password, hash) {
  const [salt, storedHash] = hash.split(':');
  const hashToVerify = crypto.createHmac('sha256', salt);
  hashToVerify.update(password);
  return hashToVerify.digest('hex') === storedHash;
}

// Function to register a new user
function registerUser(username, password) {
  if (credentials[username]) {
    throw new Error(`Username already exists: ${username}`);
  }

  const hashedPassword = hashPassword(password);
  credentials[username] = hashedPassword;

  // Save the updated credentials to the JSON file
  fs.writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2));
}

// Function to validate a user's login credentials
function validateLogin(username, password) {
  if (!credentials[username]) {
    throw new Error(`Invalid username: ${username}`);
  }

  const storedHash = credentials[username];
  if (!verifyPassword(password, storedHash)) {
    throw new Error(`Invalid password for user: ${username}`);
  }

  return true;
}

// Example usage:
try {
  registerUser('johnDoe', 'mysecretpassword');
  console.log('User registered successfully!');
} catch (error) {
  console.error(`Error: ${error.message}`);
}

try {
  const isValid = validateLogin('johnDoe', 'mysecretpassword');
  console.log(`Login valid: ${isValid}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}