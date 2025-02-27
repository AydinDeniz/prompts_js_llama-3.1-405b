// Import required libraries
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const d3 = require('d3-array');
const d3Scale = require('d3-scale');
const d3Axis = require('d3-axis');
const d3Select = require('d3-selection');

// Set up IoT device connections
const iotDevices = [
  { id: 1, type: 'temperature', value: 20 },
  { id: 2, type: 'humidity', value: 50 },
  { id: 3, type: 'energy', value: 100 },
];

// Set up Node.js server
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a new client connected');

  // Handle IoT device data updates
  socket.on('iot-data', (data) => {
    const deviceId = data.deviceId;
    const value = data.value;
    const device = iotDevices.find((device) => device.id === deviceId);
    if (device) {
      device.value = value;
      // Update the dashboard with the new data
      io.emit('iot-data', { deviceId, value });
    }
  });

  // Handle remote control commands
  socket.on('remote-control', (command) => {
    const deviceId = command.deviceId;
    const action = command.action;
    const device = iotDevices.find((device) => device.id === deviceId);
    if (device) {
      // Send the command to the IoT device
      console.log(`Sending command to device ${deviceId}: ${action}`);
    }
  });
});

// Start the server
const port = 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
// Front-end JavaScript code
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const energyElement = document.getElementById('energy');
const remoteControlForm = document.getElementById('remote-control-form');

// Set up D3.js graphs
const temperatureGraph = createGraph(temperatureElement, 'Temperature (°C)');
const humidityGraph = createGraph(humidityElement, 'Humidity (%)');
const energyGraph = createGraph(energyElement, 'Energy Consumption (W)');

// Set up WebSocket connection
const socket = io();

// Handle IoT device data updates
socket.on('iot-data', (data) => {
  const deviceId = data.deviceId;
  const value = data.value;
  switch (deviceId) {
    case 1:
      updateGraph(temperatureGraph, value);
      break;
    case 2:
      updateGraph(humidityGraph, value);
      break;
    case 3:
      updateGraph(energyGraph, value);
      break;
  }
});

// Handle remote control form submission
remoteControlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const deviceId = remoteControlForm.deviceId.value;
  const action = remoteControlForm.action.value;
  // Send the command to the server
  socket.emit('remote-control', { deviceId, action });
});

// Function to create a D3.js graph
function createGraph(element, title) {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  const svg = d3Select.select(element)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  const xScale = d3Scale.scaleTime()
    .domain([new Date(), new Date()])
    .range([0, width]);
  const yScale = d3Scale.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);
  const xAxis = d3Axis.axisBottom(xScale);
  const yAxis = d3Axis.axisLeft(yScale);
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);
  svg.append('g')
    .call(yAxis);
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text(title);
  return svg;
}

// Function to update a D3.js graph
function updateGraph(graph, value) {
  const data = [value];
  graph.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 50)
    .attr('y', (d) => 300 - d)
    .attr('width', 40)
    .attr('height', (d) => d);
}