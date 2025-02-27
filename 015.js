// Import required libraries
const indexedDB = window.indexedDB;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set up IndexedDB
const db = indexedDB.open('fitnessDB', 1);
db.onsuccess = () => {
  console.log('IndexedDB opened successfully');
};

db.onerror = () => {
  console.error('Error opening IndexedDB');
};

// Set up SQLite database connection
const sqlite3 = require('sqlite3').verbose();
const dbRemote = new sqlite3.Database('fitness.db');

// Function to log daily activities
function logActivity(type, data) {
  // Store data in IndexedDB
  const transaction = db.result.transaction('activities', 'readwrite');
  const activityStore = transaction.objectStore('activities');
  activityStore.add({ type, data });

  // Sync data with remote SQLite database when online
  if (navigator.onLine) {
    dbRemote.serialize(function() {
      dbRemote.run(`INSERT INTO activities (type, data) VALUES (?, ?)`, type, data);
    });
  }
}

// Function to visualize data as charts
function visualizeData() {
  // Get data from IndexedDB
  const transaction = db.result.transaction('activities', 'readonly');
  const activityStore = transaction.objectStore('activities');
  const request = activityStore.getAll();

  request.onsuccess = () => {
    const data = request.result;
    const steps = data.filter((activity) => activity.type === 'steps').map((activity) => activity.data);
    const workouts = data.filter((activity) => activity.type === 'workouts').map((activity) => activity.data);
    const meals = data.filter((activity) => activity.type === 'meals').map((activity) => activity.data);

    // Draw charts using Canvas API
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    steps.forEach((step, index) => {
      ctx.lineTo(index * 10, canvas.height - step);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    workouts.forEach((workout, index) => {
      ctx.lineTo(index * 10, canvas.height - workout);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    meals.forEach((meal, index) => {
      ctx.lineTo(index * 10, canvas.height - meal);
    });
    ctx.stroke();
  };
}

// Set up event listeners for logging activities
document.getElementById('log-steps').addEventListener('click', () => {
  const steps = document.getElementById('steps').value;
  logActivity('steps', steps);
  visualizeData();
});

document.getElementById('log-workout').addEventListener('click', () => {
  const workout = document.getElementById('workout').value;
  logActivity('workouts', workout);
  visualizeData();
});

document.getElementById('log-meal').addEventListener('click', () => {
  const meal = document.getElementById('meal').value;
  logActivity('meals', meal);
  visualizeData();
});

// Set up event listener for syncing data with remote SQLite database
window.addEventListener('online', () => {
  // Sync data with remote SQLite database
  dbRemote.serialize(function() {
    dbRemote.run(`INSERT INTO activities (type, data) SELECT type, data FROM activities WHERE synced = 0`);
  });
});