// Set the time limits in milliseconds
const idleTimeLimit = 300000; // 5 minutes
const logoutTimeLimit = 60000; // 1 minute

// Get the modal element
const modal = document.getElementById('idle-modal');

// Function to display the modal
function displayModal() {
  modal.style.display = 'block';
}

// Function to hide the modal
function hideModal() {
  modal.style.display = 'none';
}

// Function to log out the user
function logout() {
  // Your logout logic here
  console.log('User logged out');
}

// Set up event listeners for mouse movement and keypresses
document.addEventListener('mousemove', resetIdleTime);
document.addEventListener('keypress', resetIdleTime);

// Set up the idle timer
let idleTime = 0;
function resetIdleTime() {
  idleTime = 0;
  hideModal();
}

// Set up the interval to check for idle time
setInterval(() => {
  idleTime += 1000; // Increment the idle time by 1 second
  if (idleTime >= idleTimeLimit) {
    displayModal();
    setTimeout(() => {
      if (idleTime >= idleTimeLimit + logoutTimeLimit) {
        logout();
      }
    }, logoutTimeLimit);
  }
}, 1000);