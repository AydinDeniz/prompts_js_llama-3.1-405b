// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

// Set up Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Set secret key for JWT
const secretKey = 'your-secret-key';

// Function to create token
function createToken(user) {
  const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn: '1h',
  });
  return token;
}

// Function to verify token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate user
function authenticate(req, res, next) {
  const token = req.cookies['jwt-token'];
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).send({ message: 'Invalid token' });
  }
  req.user = decoded;
  next();
}

// Route to login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }
  const token = createToken(user);
  res.cookie('jwt-token', token, { httpOnly: true, maxAge: 3600000 });
  res.send({ message: 'Logged in successfully' });
});

// Route to register user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  const token = createToken(user);
  res.cookie('jwt-token', token, { httpOnly: true, maxAge: 3600000 });
  res.send({ message: 'Registered successfully' });
});

// Protected route
app.get('/protected', authenticate, (req, res) => {
  res.send({ message: 'Hello, ' + req.user.email });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log('Server listening on port ' + port);
});