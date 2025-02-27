// Function to monitor typing speed and accuracy
function monitorTypingSpeed(textArea, targetSpeed) {
  // Initialize variables to track typing speed and accuracy
  let startTime = 0;
  let typedText = '';
  let accuracy = 0;
  let wpm = 0;

  // Create a progress bar to visualize typing speed
  const progressBar = document.createElement('progress');
  progressBar.max = targetSpeed;
  progressBar.value = 0;
  document.body.appendChild(progressBar);

  // Create a paragraph to display the typing text
  const typingText = document.createElement('p');
  typingText.textContent = 'Type the following text: ';
  document.body.appendChild(typingText);

  // Create a span to display the typed text
  const typedTextSpan = document.createElement('span');
  typedTextSpan.textContent = '';
  typingText.appendChild(typedTextSpan);

  // Create a paragraph to display the WPM and accuracy
  const wpmAccuracyText = document.createElement('p');
  wpmAccuracyText.textContent = 'WPM: 0, Accuracy: 0%';
  document.body.appendChild(wpmAccuracyText);

  // Add an event listener to the text area for keyup events
  textArea.addEventListener('keyup', () => {
    // Get the current typed text
    const currentText = textArea.value;

    // Calculate the elapsed time
    const elapsedTime = (new Date().getTime() - startTime) / 1000;

    // Calculate the typing speed (WPM)
    wpm = (currentText.split(' ').length / elapsedTime) * 60;

    // Calculate the accuracy
    accuracy = (currentText.split(' ').filter((word, index) => word === typedText.split(' ')[index]).length / currentText.split(' ').length) * 100;

    // Update the progress bar
    progressBar.value = wpm;

    // Update the WPM and accuracy text
    wpmAccuracyText.textContent = `WPM: ${wpm.toFixed(2)}, Accuracy: ${accuracy.toFixed(2)}%`;

    // Update the typed text span
    typedTextSpan.textContent = currentText;
  });

  // Add an event listener to the text area for focus events
  textArea.addEventListener('focus', () => {
    // Set the start time
    startTime = new Date().getTime();
  });

  // Set the typing text
  typedText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  // Update the typing text paragraph
  typingText.textContent = `Type the following text: ${typedText}`;
}

// Get the text area element
const textArea = document.getElementById('text-area');

// Set the target speed
const targetSpeed = 60;

// Call the function to monitor typing speed and accuracy
monitorTypingSpeed(textArea, targetSpeed);