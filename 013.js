// Get the product ID from the URL parameter
const productId = new URLSearchParams(window.location.search).get('id');

// Fetch the product data from the RESTful API
fetch(`https://example.com/api/products/${productId}`)
  .then(response => response.json())
  .then(data => {
    // Display the product details
    document.getElementById('product-name').textContent = data.name;
    document.getElementById('product-description').textContent = data.description;
    document.getElementById('product-price').textContent = data.price;

    // Display the product images
    const imageContainer = document.getElementById('product-images');
    data.images.forEach(image => {
      const img = document.createElement('img');
      img.src = image.url;
      imageContainer.appendChild(img);
    });

    // Display the product reviews
    const reviewContainer = document.getElementById('product-reviews');
    data.reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.textContent = review.text;
      reviewElement.rating = review.rating;
      reviewContainer.appendChild(reviewElement);
    });
  });

// Implement client-side filtering for reviews based on ratings
const reviewFilter = document.getElementById('review-filter');
reviewFilter.addEventListener('change', () => {
  const reviewContainer = document.getElementById('product-reviews');
  const reviews = reviewContainer.children;
  const filterValue = reviewFilter.value;

  reviews.forEach(review => {
    if (review.rating >= filterValue) {
      review.style.display = 'block';
    } else {
      review.style.display = 'none';
    }
  });
});

// Use IndexedDB to cache data for offline access
const db = indexedDB.open('productDB', 1);
db.onsuccess = () => {
  const transaction = db.result.transaction('products', 'readwrite');
  const productStore = transaction.objectStore('products');

  // Cache the product data in IndexedDB
  fetch(`https://example.com/api/products/${productId}`)
    .then(response => response.json())
    .then(data => {
      productStore.put(data);
    });
};

db.onerror = () => {
  console.error('Error opening IndexedDB');
};

// Check if the product data is cached in IndexedDB
const cachedProduct = indexedDB.open('productDB', 1);
cachedProduct.onsuccess = () => {
  const transaction = cachedProduct.result.transaction('products', 'readonly');
  const productStore = transaction.objectStore('products');
  const request = productStore.get(productId);

  request.onsuccess = () => {
    if (request.result) {
      // Display the cached product data
      document.getElementById('product-name').textContent = request.result.name;
      document.getElementById('product-description').textContent = request.result.description;
      document.getElementById('product-price').textContent = request.result.price;
    }
  };
};