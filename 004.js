// Frontend JavaScript code
async function validateAndSubmitForm(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phoneNumber = document.getElementById('phone-number').value;

  if (!validateName(name)) {
    alert('Please enter a valid name');
    return;
  }

  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }

  if (!validatePhoneNumber(phoneNumber)) {
    alert('Please enter a valid phone number');
    return;
  }

  try {
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phoneNumber }),
    });

    const result = await response.json();
    if (result.success) {
      alert('Form submitted successfully!');
    } else {
      alert('Error submitting form: ' + result.error);
    }
  } catch (error) {
    alert('Error submitting form: ' + error.message);
  }
}

function validateName(name) {
  return name.trim() !== '';
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

// Backend Node.js code
const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'your-host',
  user: 'your-user',
  password: 'your-password',
  database: 'your-database',
});

db.connect((err) => {
  if (err) {
    console.error('error connecting:', err);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

app.post('/submit-form', (req, res) => {
  const { name, email, phoneNumber } = req.body;

  const query = 'INSERT INTO your-table (name, email, phone_number) VALUES (?, ?, ?)';
  db.query(query, [name, email, phoneNumber], (err, results) => {
    if (err) {
      console.error('error running query:', err);
      res.json({ success: false, error: 'Error inserting data into database' });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});