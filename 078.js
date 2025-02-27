// Function to detect and prevent special characters in input field
function preventSpecialCharacters(inputField) {
  // Define a regular expression to match special characters
  const specialCharsRegex = /[^a-zA-Z0-9\s]/g;

  // Add an event listener to the input field for paste events
  inputField.addEventListener('paste', (event) => {
    // Get the pasted text
    const pastedText = event.clipboardData.getData('text');

    // Check if the pasted text contains special characters
    if (specialCharsRegex.test(pastedText)) {
      // Prevent the paste event
      event.preventDefault();

      // Provide real-time feedback on invalid characters
      alert('Invalid characters detected. Please paste only alphanumeric characters and spaces.');
    }
  });

  // Add an event listener to the input field for keyup events
  inputField.addEventListener('keyup', () => {
    // Get the current input value
    const inputValue = inputField.value;

    // Check if the input value contains special characters
    if (specialCharsRegex.test(inputValue)) {
      // Remove the special characters from the input value
      inputField.value = inputValue.replace(specialCharsRegex, '');

      // Provide real-time feedback on invalid characters
      alert('Invalid characters detected. Please enter only alphanumeric characters and spaces.');
    }
  });
}

// Get the input field element
const inputField = document.getElementById('input-field');

// Call the function to prevent special characters
preventSpecialCharacters(inputField);