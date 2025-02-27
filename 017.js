// Front-end JavaScript code
const bookingForm = document.getElementById('booking-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const carSelect = document.getElementById('car-select');
const rentalDurationInput = document.getElementById('rental-duration');
const paymentMethodSelect = document.getElementById('payment-method');
const cardNumberInput = document.getElementById('card-number');
const expirationDateInput = document.getElementById('expiration-date');
const cvvInput = document.getElementById('cvv');

// Validate form entries
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const phone = phoneInput.value;
  const car = carSelect.value;
  const rentalDuration = rentalDurationInput.value;
  const paymentMethod = paymentMethodSelect.value;
  const cardNumber = cardNumberInput.value;
  const expirationDate = expirationDateInput.value;
  const cvv = cvvInput.value;

  if (!name || !email || !phone || !car || !rentalDuration || !paymentMethod || !cardNumber || !expirationDate || !cvv) {
    alert('Please fill in all fields');
    return;
  }

  // Send data to Express.js server
  fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      car,
      rentalDuration,
      paymentMethod,
      cardNumber,
      expirationDate,
      cvv,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
});

// Search for available cars
const searchForm = document.getElementById('search-form');
const searchCriteriaInput = document.getElementById('search-criteria');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchCriteria = searchCriteriaInput.value;

  fetch(`/search?criteria=${searchCriteria}`)
    .then((res) => res.json())
    .then((data) => {
      const availableCarsHtml = data.map((car) => `<p>${car.make} ${car.model}</p>`).join('');
      document.getElementById('available-cars').innerHTML = availableCarsHtml;
    })
    .catch((err) => console.error(err));
});

// Express.js server code
const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Set up MySQL database connection
const db = mysql.createConnection({
  host: 'your_host',
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
});

db.connect((err) => {
  if (err) {
    console.error('error connecting:', err);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

// Set up Express.js server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle booking form submission
app.post('/bookings', (req, res) => {
  const { name, email, phone, car, rentalDuration, paymentMethod, cardNumber, expirationDate, cvv } = req.body;

  const query = `INSERT INTO bookings (name, email, phone, car, rental_duration, payment_method, card_number, expiration_date, cvv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [name, email, phone, car, rentalDuration, paymentMethod, cardNumber, expirationDate, cvv], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error booking car' });
    } else {
      res.send({ message: 'Car booked successfully' });
    }
  });
});

// Handle search form submission
app.get('/search', (req, res) => {
  const searchCriteria = req.query.criteria;

  const query = `SELECT * FROM cars WHERE make LIKE ? OR model LIKE ?`;
  db.query(query, [`%${searchCriteria}%`, `%${searchCriteria}%`], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error searching for cars' });
    } else {
      res.send(result);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});