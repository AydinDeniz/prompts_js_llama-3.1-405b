// Frontend JavaScript code
const form = document.getElementById('registration-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const event = document.getElementById('event').value;
  const dietaryPreferences = document.getElementById('dietary-preferences').value;

  if (!name || !email || !event || !dietaryPreferences) {
    alert('Please fill in all fields');
    return;
  }

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, event, dietaryPreferences }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Registration successful!');
  } else {
    alert('Error registering for event');
  }
});

// Backend Node.js/Express code
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const qrCodeGenerator = require('qrcode-generator');
const nodemailer = require('nodemailer');

mongoose.connect('mongodb://localhost/event-registration', { useNewUrlParser: true, useUnifiedTopology: true });

const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  event: String,
  dietaryPreferences: String,
  qrCode: String,
});

const Registration = mongoose.model('Registration', registrationSchema);

app.use(express.json());

app.post('/register', async (req, res) => {
  const { name, email, event, dietaryPreferences } = req.body;

  const registration = new Registration({ name, email, event, dietaryPreferences });
  await registration.save();

  const qrCode = qrCodeGenerator.generate(registration._id.toString());
  registration.qrCode = qrCode;
  await registration.save();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-password',
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Event Registration Confirmation',
    text: 'Thank you for registering for the event!',
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrCode,
        encoding: 'base64',
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});