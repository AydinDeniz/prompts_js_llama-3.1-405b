// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fitness', { useNewUrlParser: true, useUnifiedTopology: true });

// Define user model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  fitnessGoals: String,
  workoutLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  mealLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
});
const User = mongoose.model('User', userSchema);

// Define workout model
const workoutSchema = new mongoose.Schema({
  date: Date,
  exercise: String,
  sets: Number,
  reps: Number,
  weight: Number,
});
const Workout = mongoose.model('Workout', workoutSchema);

// Define meal model
const mealSchema = new mongoose.Schema({
  date: Date,
  food: String,
  calories: Number,
  protein: Number,
  carbohydrates: Number,
  fat: Number,
});
const Meal = mongoose.model('Meal', mealSchema);

// Define API endpoint for user registration
app.post('/register', (req, res) => {
  const user = new User(req.body);
  user.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'User registered successfully' });
    }
  });
});

// Define API endpoint for user login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.error(err);
    } else if (!user) {
      res.json({ message: 'User not found' });
    } else if (user.password !== password) {
      res.json({ message: 'Incorrect password' });
    } else {
      res.json({ message: 'User logged in successfully' });
    }
  });
});

// Define API endpoint for workout logging
app.post('/workout', (req, res) => {
  const workout = new Workout(req.body);
  workout.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Workout logged successfully' });
    }
  });
});

// Define API endpoint for meal tracking
app.post('/meal', (req, res) => {
  const meal = new Meal(req.body);
  meal.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Meal tracked successfully' });
    }
  });
});

// Define API endpoint for integration with fitness device APIs
app.get('/fitness-device', (req, res) => {
  const deviceId = req.query.deviceId;
  const deviceType = req.query.deviceType;
  if (deviceType === 'fitbit') {
    axios.get(`https://api.fitbit.com/1/user/-/activities.json?access_token=${process.env.FITBIT_ACCESS_TOKEN}`)
      .then((response) => {
        const activities = response.data.activities;
        res.json(activities);
      })
      .catch((error) => {
        console.error(error);
      });
  } else if (deviceType === 'garmin') {
    axios.get(`https://connectapi.garmin.com/v1/users/self/activities.json?access_token=${process.env.GARMIN_ACCESS_TOKEN}`)
      .then((response) => {
        const activities = response.data.activities;
        res.json(activities);
      })
      .catch((error) => {
        console.error(error);
      });
  }
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

  socket.on('workout-logged', (workout) => {
    const newWorkout = new Workout(workout);
    newWorkout.save((err) => {
      if (err) {
        console.error(err);
      } else {
        io.emit('workout-logged', newWorkout);
      }
    });
  });

  socket.on('meal-tracked', (meal) => {
    const newMeal = new Meal(meal);
    newMeal.save((err) => {
      if (err) {
        console.error(err);
      } else {
        io.emit('meal-tracked', newMeal);
      }
    });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});