// Import required libraries
const fetch = require('node-fetch');
const localStorage = require('local-storage');

// Set up API endpoint and API key
const apiEndpoint = 'https://newsapi.org/v2/top-headlines';
const apiKey = 'YOUR_API_KEY';

// Set up local storage
const storage = localStorage;

// Function to fetch news articles
async function fetchNews(topic) {
  const response = await fetch(`${apiEndpoint}?q=${topic}&apiKey=${apiKey}`);
  const data = await response.json();
  return data.articles;
}

// Function to display news articles
function displayNews(articles) {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';
  articles.forEach((article) => {
    const articleElement = document.createElement('div');
    articleElement.innerHTML = `
      <h2>${article.title}</h2>
      <p>${article.description}</p>
      <a href="${article.url}">Read more</a>
    `;
    newsContainer.appendChild(articleElement);
  });
}

// Function to store user preferences in local storage
function storePreferences(topics) {
  storage.set('topics', topics);
}

// Function to fetch user preferences from local storage
function fetchPreferences() {
  return storage.get('topics');
}

// Function to fetch news articles based on user preferences
async function fetchPreferredNews() {
  const topics = fetchPreferences();
  const articles = [];
  for (const topic of topics) {
    const topicArticles = await fetchNews(topic);
    articles.push(...topicArticles);
  }
  return articles;
}

// Function to display notification for breaking news
function displayNotification(article) {
  const notificationElement = document.createElement('div');
  notificationElement.innerHTML = `
    <h2>Breaking News</h2>
    <p>${article.title}</p>
    <a href="${article.url}">Read more</a>
  `;
  document.body.appendChild(notificationElement);
}

// Set up event listeners
document.getElementById('topic-select').addEventListener('change', (e) => {
  const topic = e.target.value;
  fetchNews(topic).then((articles) => displayNews(articles));
});

document.getElementById('save-preferences').addEventListener('click', () => {
  const topics = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox) => checkbox.value);
  storePreferences(topics);
});

document.getElementById('fetch-preferred-news').addEventListener('click', () => {
  fetchPreferredNews().then((articles) => displayNews(articles));
});

// Set up notification system
setInterval(() => {
  fetchPreferredNews().then((articles) => {
    const breakingNews = articles.find((article) => article.publishedAt > Date.now() - 1000 * 60 * 60);
    if (breakingNews) {
      displayNotification(breakingNews);
    }
  });
}, 1000 * 60 * 60);

// Initialize news container
const newsContainer = document.getElementById('news-container');
newsContainer.innerHTML = '';