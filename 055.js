// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');

// Define mock data for users and products
const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Doe' },
  { id: 3, name: 'Bob Smith' },
];

const products = [
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' },
  { id: 3, name: 'Product C' },
  { id: 4, name: 'Product D' },
  { id: 5, name: 'Product E' },
];

// Define mock data for user interactions
const interactions = [
  { userId: 1, productId: 1, rating: 5 },
  { userId: 1, productId: 2, rating: 4 },
  { userId: 1, productId: 3, rating: 3 },
  { userId: 2, productId: 2, rating: 5 },
  { userId: 2, productId: 4, rating: 4 },
  { userId: 3, productId: 1, rating: 4 },
  { userId: 3, productId: 5, rating: 5 },
];

// Define function for collaborative filtering
function collaborativeFiltering(userId) {
  const userInteractions = interactions.filter((interaction) => interaction.userId === userId);
  const productRatings = {};
  userInteractions.forEach((interaction) => {
    productRatings[interaction.productId] = interaction.rating;
  });
  const recommendedProducts = [];
  products.forEach((product) => {
    if (!productRatings[product.id]) {
      const similarUsers = users.filter((user) => user.id !== userId);
      const similarUserInteractions = interactions.filter((interaction) => similarUsers.includes(interaction.userId));
      const productRating = similarUserInteractions.reduce((acc, interaction) => {
        if (interaction.productId === product.id) {
          acc += interaction.rating;
        }
        return acc;
      }, 0) / similarUserInteractions.length;
      recommendedProducts.push({ product, rating: productRating });
    }
  });
  return recommendedProducts.sort((a, b) => b.rating - a.rating);
}

// Define API endpoint for product recommendations
app.get('/recommendations', (req, res) => {
  const userId = req.query.userId;
  const recommendations = collaborativeFiltering(userId);
  res.json(recommendations);
});

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

  socket.on('get-recommendations', (userId) => {
    const recommendations = collaborativeFiltering(userId);
    socket.emit('recommendations', recommendations);
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});