// JavaScript
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const recentSearches = document.getElementById('recent-searches');
const currentWeatherDescription = document.getElementById('current-weather-description');
const currentTemperature = document.getElementById('current-temperature');
const currentHumidity = document.getElementById('current-humidity');
const currentWindSpeed = document.getElementById('current-wind-speed');
const forecastChart = document.getElementById('forecast-chart');

const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
const recentSearchesStorageKey = 'recentSearches';

let recentSearchesArray = JSON.parse(localStorage.getItem(recentSearchesStorageKey)) || [];

searchButton.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  if (city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`);
    const data = await response.json();
    displayCurrentWeather(data);

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`);
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);

    recentSearchesArray.push(city);
    recentSearchesArray = recentSearchesArray.slice(-5);
    localStorage.setItem(recentSearchesStorageKey, JSON.stringify(recentSearchesArray));
    displayRecentSearches();
  }
});

function displayCurrentWeather(data) {
  currentWeatherDescription.textContent = data.weather[0].description;
  currentTemperature.textContent = `Temperature: ${data.main.temp}°F`;
  currentHumidity.textContent = `Humidity: ${data.main.humidity}%`;
  currentWindSpeed.textContent = `Wind Speed: ${data.wind.speed} mph`;
}

function displayForecast(data) {
  const forecastTemperatures = data.list.map((forecast) => forecast.main.temp);
  const forecastLabels = data.list.map((forecast) => forecast.dt_txt);

  const ctx = forecastChart.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecastLabels,
      datasets: [{
        label: 'Temperature',
        data: forecastTemperatures,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

function displayRecentSearches() {
  recentSearches.innerHTML = '';
  recentSearchesArray.forEach((city) => {
    const li = document.createElement('li');
    li.textContent = city;
    recentSearches.appendChild(li);
  });
}