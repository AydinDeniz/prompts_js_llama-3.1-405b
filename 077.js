// Function to toggle dark mode
function toggleDarkMode() {
  // Get the current theme from local storage
  const currentTheme = localStorage.getItem('theme');

  // Toggle the theme
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Save the new theme to local storage
  localStorage.setItem('theme', newTheme);

  // Apply the new theme to the document
  document.documentElement.classList.toggle('dark-mode', newTheme === 'dark');

  // Update the toggle button's text and icon
  const toggleButton = document.getElementById('dark-mode-toggle');
  toggleButton.textContent = newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  toggleButton.classList.toggle('dark-mode-toggle', newTheme === 'dark');
}

// Function to apply the saved theme on page load
function applySavedTheme() {
  // Get the saved theme from local storage
  const savedTheme = localStorage.getItem('theme');

  // If a theme is saved, apply it to the document
  if (savedTheme) {
    document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');

    // Update the toggle button's text and icon
    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.textContent = savedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    toggleButton.classList.toggle('dark-mode-toggle', savedTheme === 'dark');
  }
}

// Add an event listener to the toggle button
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

// Apply the saved theme on page load
applySavedTheme();

// Add a transition effect to the theme change
document.documentElement.style.transition = 'background-color 0.3s ease-in-out';

// Define a function to change the theme based on the time of day
function changeThemeBasedOnTime() {
  const currentTime = new Date().getHours();
  if (currentTime >= 6 && currentTime < 18) {
    // Daytime, switch to light mode
    toggleDarkMode();
  } else {
    // Nighttime, switch to dark mode
    toggleDarkMode();
  }
}

// Call the function to change the theme based on the time of day
changeThemeBasedOnTime();

// Add an event listener to the window to update the theme when the time changes
window.addEventListener('timeupdate', changeThemeBasedOnTime);