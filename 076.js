// Function to lazy-load images
function lazyLoadImages() {
  // Get all images with the lazy-load class
  const images = document.querySelectorAll('.lazy-load');

  // Set the threshold for loading images (in pixels)
  const threshold = 200;

  // Function to check if an image is near the viewport
  function isNearViewport(image) {
    const rect = image.getBoundingClientRect();
    return rect.top + threshold >= 0 && rect.bottom - threshold <= globalThis.innerHeight;
  }

  // Function to load a high-resolution image
  function loadHighResImage(image) {
    // Get the high-resolution image URL from the data-src attribute
    const highResUrl = image.getAttribute('data-src');

    // Create a new image element for the high-resolution image
    const highResImage = new globalThis.Image();
    highResImage.src = highResUrl;

    // Wait for the high-resolution image to load
    highResImage.onload = () => {
      // Replace the placeholder thumbnail with the high-resolution image
      image.src = highResUrl;

      // Add a class to fade in the high-resolution image
      image.classList.add('fade-in');
    };
  }

  // Function to handle scroll events
  function handleScroll() {
    // Loop through all images and check if they are near the viewport
    images.forEach(image => {
      if (isNearViewport(image)) {
        // Load the high-resolution image
        loadHighResImage(image);

        // Remove the lazy-load class to prevent re-loading
        image.classList.remove('lazy-load');
      }
    });
  }

  // Add an event listener to handle scroll events
  globalThis.addEventListener('scroll', handleScroll);

  // Handle initial scroll position
  handleScroll();
}

// Call the lazy-load function
lazyLoadImages();