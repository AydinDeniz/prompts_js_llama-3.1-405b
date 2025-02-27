// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

// Define API endpoint for recipe search
app.get('/recipes', (req, res) => {
  const ingredients = req.query.ingredients;
  const apiKey = 'YOUR_API_KEY';
  const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}`;
  axios.get(url)
    .then((response) => {
      const recipes = response.data;
      res.json(recipes);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Define API endpoint for meal planning
app.post('/meal-plan', (req, res) => {
  const recipes = req.body.recipes;
  const mealPlan = [];
  recipes.forEach((recipe) => {
    mealPlan.push({
      day: recipe.day,
      meal: recipe.meal,
      recipe: recipe.recipe,
    });
  });
  res.json(mealPlan);
});

// Define API endpoint for nutritional insights
app.get('/nutrition', (req, res) => {
  const recipeId = req.query.recipeId;
  const apiKey = 'YOUR_API_KEY';
  const url = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey}`;
  axios.get(url)
    .then((response) => {
      const nutritionData = response.data;
      res.json(nutritionData);
    })
    .catch((error) => {
      console.error(error);
    });
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

  socket.on('search-recipes', (ingredients) => {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}`;
    axios.get(url)
      .then((response) => {
        const recipes = response.data;
        socket.emit('recipes', recipes);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  socket.on('plan-meals', (recipes) => {
    const mealPlan = [];
    recipes.forEach((recipe) => {
      mealPlan.push({
        day: recipe.day,
        meal: recipe.meal,
        recipe: recipe.recipe,
      });
    });
    socket.emit('meal-plan', mealPlan);
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});