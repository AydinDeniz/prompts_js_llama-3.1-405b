// Function to implement infinite scrolling
function infiniteScrolling() {
  // Get the container element
  const container = document.getElementById('container');

  // Set the debounce timeout to 500ms
  const debounceTimeout = 500;

  // Set the API endpoint URL
  const apiUrl = 'https://api.example.com/content';

  // Set the page number to 1
  let pageNumber = 1;

  // Function to fetch and append new content
  function fetchAndAppendContent() {
    // Fetch new content from the API
    fetch(`${apiUrl}?page=${pageNumber}`)
      .then(response => response.json())
      .then(data => {
        // Append new content to the container
        const content = data.map(item => {
          const element = document.createElement('div');
          element.textContent = item.text;
          return element;
        });
        container.append(...content);

        // Increment the page number
        pageNumber++;
      })
      .catch(error => console.error(error));
  }

  // Function to handle scroll events
  function handleScroll() {
    // Check if the user has scrolled to the bottom of the container
    if (container.scrollTop + container.offsetHeight >= container.scrollHeight) {
      // Fetch and append new content
      fetchAndAppendContent();
    }
  }

  // Debounce function to prevent excessive API calls
  function debounce(func, timeout) {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(func, timeout);
    };
  }

  // Add an event listener to the container to handle scroll events
  container.addEventListener('scroll', debounce(handleScroll, debounceTimeout));

  // Fetch and append initial content
  fetchAndAppendContent();
}

// Call the infinite scrolling function
infiniteScrolling();