// Front-end JavaScript code
const appointmentForm = document.getElementById('appointment-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const submitButton = document.getElementById('submit-button');
const calendarContainer = document.getElementById('calendar-container');

// Initialize FullCalendar.js
const calendar = new FullCalendar.Calendar(calendarContainer, {
  plugins: ['interaction', 'dayGrid'],
  defaultDate: new Date(),
  editable: true,
  eventLimit: true,
  events: [],
});

// Render the calendar
calendar.render();

// Handle appointment form submission
appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const date = dateInput.value;
  const time = timeInput.value;

  // Validate user inputs
  if (!name || !email || !date || !time) {
    alert('Please fill in all fields');
    return;
  }

  // Send request to Node.js backend
  fetch('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, date, time }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // Update the calendar with the new appointment
      calendar.addEvent({
        title: name,
        start: date + 'T' + time,
        end: date + 'T' + time,
      });
    })
    .catch((err) => console.error(err));
});

// Fetch appointments from Node.js backend
fetch('/appointments')
  .then((res) => res.json())
  .then((data) => {
    // Add appointments to the calendar
    data.forEach((appointment) => {
      calendar.addEvent({
        title: appointment.name,
        start: appointment.date + 'T' + appointment.time,
        end: appointment.date + 'T' + appointment.time,
      });
    });
  })
  .catch((err) => console.error(err));

  // Back-end Node.js code
const express = require('express');
const app = express();
const pg = require('pg');
const bodyParser = require('body-parser');

// Set up PostgreSQL database connection
const db = new pg.Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error('connection error', err);
  } else {
    console.log('connected');
  }
});

// Set up Express.js server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle appointment creation
app.post('/appointments', (req, res) => {
  const { name, email, date, time } = req.body;

  // Validate user inputs
  if (!name || !email || !date || !time) {
    res.status(400).send({ message: 'Please fill in all fields' });
    return;
  }

  // Insert appointment into PostgreSQL database
  const query = {
    text: `INSERT INTO appointments (name, email, date, time) VALUES ($1, $2, $3, $4) RETURNING *`,
    values: [name, email, date, time],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error creating appointment' });
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Handle appointment retrieval
app.get('/appointments', (req, res) => {
  const query = {
    text: 'SELECT * FROM appointments',
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error retrieving appointments' });
    } else {
      res.send(result.rows);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});