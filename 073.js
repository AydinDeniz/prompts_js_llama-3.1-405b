// Function to detect internet connection status
function detectConnectionStatus() {
  // Check if the user is online or offline
  if (navigator.onLine) {
    // If online, sync cached form inputs with the backend
    syncCachedInputs();
  } else {
    // If offline, display a notification
    displayNotification('You are currently offline.');
  }

  // Add event listeners for online and offline events
  window.addEventListener('online', () => {
    // If online, sync cached form inputs with the backend
    syncCachedInputs();
    displayNotification('You are now online.');
  });

  window.addEventListener('offline', () => {
    // If offline, display a notification
    displayNotification('You are currently offline.');
  });
}

// Function to cache form inputs using local storage
function cacheFormInputs(form) {
  // Get the form data
  const formData = new FormData(form);

  // Convert the form data to an object
  const formObject = {};
  for (const [key, value] of formData) {
    formObject[key] = value;
  }

  // Cache the form inputs using local storage
  localStorage.setItem('cachedInputs', JSON.stringify(formObject));
}

// Function to sync cached form inputs with the backend
function syncCachedInputs() {
  // Get the cached form inputs from local storage
  const cachedInputs = localStorage.getItem('cachedInputs');

  // If there are cached inputs, send them to the backend
  if (cachedInputs) {
    const formData = JSON.parse(cachedInputs);
    fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

    // Clear the cached inputs from local storage
    localStorage.removeItem('cachedInputs');
  }
}

// Function to display a notification
function displayNotification(message) {
  // Create a notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.classList.add('notification');

  // Add the notification to the page
  document.body.appendChild(notification);

  // Remove the notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Get the form element
const form = document.getElementById('myForm');

// Add an event listener to the form to cache form inputs when submitted
form.addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Cache the form inputs using local storage
  cacheFormInputs(form);

  // If online, sync the cached inputs with the backend
  if (navigator.onLine) {
    syncCachedInputs();
  }
});

// Detect the internet connection status
detectConnectionStatus();

const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Route to handle form submission
app.post('/api/submit-form', (req, res) => {
  // Get the form data
  const formData = req.body;

  // Process the form data
  console.log(formData);

  // Return a success response
  res.json({ message: 'Form submitted successfully' });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});