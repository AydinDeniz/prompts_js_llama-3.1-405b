// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { Chart } = require('chart.js');

// Define API endpoint for retrieving weather data
app.get('/weather', (req, res) => {
  const location = req.query.location;
  const apiKey = 'YOUR_API_KEY';
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
  axios.get(url)
    .then((response) => {
      const weatherData = response.data;
      res.json(weatherData);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Define API endpoint for location-based forecasts
app.get('/forecast', (req, res) => {
  const location = req.query.location;
  const apiKey = 'YOUR_API_KEY';
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`;
  axios.get(url)
    .then((response) => {
      const forecastData = response.data;
      res.json(forecastData);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Define API endpoint for hourly and weekly views
app.get('/hourly-weekly', (req, res) => {
  const location = req.query.location;
  const apiKey = 'YOUR_API_KEY';
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`;
  axios.get(url)
    .then((response) => {
      const forecastData = response.data;
      const hourlyData = forecastData.list.slice(0, 8);
      const weeklyData = forecastData.list.slice(8);
      res.json({ hourly: hourlyData, weekly: weeklyData });
    })
    .catch((error) => {
      console.error(error);
    });
});

// Define API endpoint for historical weather data visualization
app.get('/historical', (req, res) => {
  const location = req.query.location;
  const apiKey = 'YOUR_API_KEY';
  const url = `http://api.openweathermap.org/data/2.5/onecall/timemachine?q=${location}&appid=${apiKey}`;
  axios.get(url)
    .then((response) => {
      const historicalData = response.data;
      const chartData = historicalData.hourly.map((data) => ({ date: data.dt, temp: data.temp }));
      const chart = new Chart('chart', {
        type: 'line',
        data: {
          labels: chartData.map((data) => data.date),
          datasets: [{
            label: 'Temperature',
            data: chartData.map((data) => data.temp),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
          },
        },
      });
      res.json(chart);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Handle incoming Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('get-weather', (location) => {
    const apiKey = 'YOUR_API_KEY';
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    axios.get(url)
      .then((response) => {
        const weatherData = response.data;
        socket.emit('weather-data', weatherData);
      })
      .catch((error) => {
        console.error(error);
      });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});