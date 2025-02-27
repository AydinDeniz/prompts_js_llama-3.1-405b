// Function to auto-save form data to local storage
function autoSaveForm() {
  // Get the form element
  const form = document.getElementById('myForm');

  // Set the auto-save interval to 5 seconds
  const autoSaveInterval = 5000;

  // Function to save form data to local storage
  function saveFormData() {
    // Get the form data
    const formData = new FormData(form);

    // Convert the form data to an object
    const formObject = {};
    for (const [key, value] of formData) {
      formObject[key] = value;
    }

    // Save the form data to local storage
    localStorage.setItem('savedFormData', JSON.stringify(formObject));
  }

  // Set up the auto-save interval
  setInterval(saveFormData, autoSaveInterval);
}

// Function to restore saved form data from local storage
function restoreSavedFormData() {
  // Get the saved form data from local storage
  const savedFormData = localStorage.getItem('savedFormData');

  // If there is saved form data, restore it
  if (savedFormData) {
    // Parse the saved form data
    const formObject = JSON.parse(savedFormData);

    // Get the form element
    const form = document.getElementById('myForm');

    // Restore the saved form data
    for (const [key, value] of Object.entries(formObject)) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    }

    // Display a message confirming restoration
    displayMessage('Saved form data restored.');
  }
}

// Function to display a message
function displayMessage(message) {
  // Create a message element
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.classList.add('message');

  // Add the message to the page
  document.body.appendChild(messageElement);

  // Remove the message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Auto-save the form data
autoSaveForm();

// Restore saved form data when the page loads
document.addEventListener('DOMContentLoaded', restoreSavedFormData);

// Restore saved form data when the user comes back to the page
window.addEventListener('focus', restoreSavedFormData);

// Save the form data when the user leaves the page
window.addEventListener('beforeunload', () => {
  // Get the form element
  const form = document.getElementById('myForm');

  // Save the form data to local storage
  const formData = new FormData(form);
  const formObject = {};
  for (const [key, value] of formData) {
    formObject[key] = value;
  }
  localStorage.setItem('savedFormData', JSON.stringify(formObject));
});