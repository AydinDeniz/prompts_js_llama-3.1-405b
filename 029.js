// Front-end JavaScript code
const healthForm = document.getElementById('health-form');
const healthMetrics = document.getElementById('health-metrics');
const recommendations = document.getElementById('recommendations');

// Set up TensorFlow.js model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

// Load pre-trained model
async function loadModel() {
  const modelJson = await fetch('model.json');
  const modelWeights = await fetch('model.weights.bin');
  model.loadLayersModel(modelJson);
  model.loadWeights(modelWeights);
}

// Analyze health metrics and generate recommendations
async function analyzeHealthMetrics(healthMetrics) {
  const predictions = await model.predict(healthMetrics);
  const recommendations = await generateRecommendations(predictions);
  return recommendations;
}

// Generate recommendations based on predictions
async function generateRecommendations(predictions) {
  const dietPlans = await fetch('diet-plans.json');
  const exercisePlans = await fetch('exercise-plans.json');
  const recommendations = [];
  for (const prediction of predictions) {
    const dietPlan = dietPlans[prediction];
    const exercisePlan = exercisePlans[prediction];
    recommendations.push({ dietPlan, exercisePlan });
  }
  return recommendations;
}

// Handle form submission
healthForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const healthMetrics = await getHealthMetrics();
  const recommendations = await analyzeHealthMetrics(healthMetrics);
  displayRecommendations(recommendations);
});

// Get health metrics from form
async function getHealthMetrics() {
  const healthMetrics = {};
  const formElements = healthForm.elements;
  for (const element of formElements) {
    healthMetrics[element.name] = element.value;
  }
  return healthMetrics;
}

// Display recommendations
function displayRecommendations(recommendations) {
  recommendations.innerHTML = '';
  for (const recommendation of recommendations) {
    const dietPlan = recommendation.dietPlan;
    const exercisePlan = recommendation.exercisePlan;
    const recommendationElement = document.createElement('div');
    recommendationElement.innerHTML = `
      <h2>Diet Plan:</h2>
      <p>${dietPlan}</p>
      <h2>Exercise Plan:</h2>
      <p>${exercisePlan}</p>
    `;
    recommendations.appendChild(recommendationElement);
  }
}

// Load pre-trained model and initialize app
loadModel();

// Back-end JavaScript code (Node.js)
const express = require('express');
const app = express();
const pg = require('pg');

// Set up PostgreSQL database connection
const db = new pg.Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

// Set up routes
app.post('/health-metrics', async (req, res) => {
  const healthMetrics = req.body;
  const userId = req.user.id;
  await db.query(`INSERT INTO health_metrics (user_id, health_metrics) VALUES ($1, $2)`, [userId, healthMetrics]);
  res.json({ message: 'Health metrics saved successfully' });
});

app.get('/diet-plans', async (req, res) => {
  const dietPlans = await db.query(`SELECT * FROM diet_plans`);
  res.json(dietPlans.rows);
});

app.get('/exercise-plans', async (req, res) => {
  const exercisePlans = await db.query(`SELECT * FROM exercise_plans`);
  res.json(exercisePlans.rows);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


// PostgreSQL database schema
const healthMetricsSchema = `
  CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    health_metrics JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const dietPlansSchema = `
  CREATE TABLE diet_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const exercisePlansSchema = `
  CREATE TABLE exercise_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;