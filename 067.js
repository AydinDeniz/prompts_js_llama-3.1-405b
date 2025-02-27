// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { D3 } = require('d3');
const { Chart } = require('chart.js');
const { AlphaVantage } = require('alphavantage');

// Define stock market data visualization tool
class StockMarketDataVisualizationTool {
  constructor() {
    this.stockSymbols = ['AAPL', 'GOOG', 'MSFT', 'AMZN', 'FB'];
    this.historicalData = {};
    this.realTimeData = {};
  }

  async fetchHistoricalData() {
    const alphaVantage = new AlphaVantage('YOUR_API_KEY');
    for (const stockSymbol of this.stockSymbols) {
      const response = await alphaVantage.getDailyAdjusted(stockSymbol);
      this.historicalData[stockSymbol] = response.data;
    }
  }

  async fetchRealTimeData() {
    const alphaVantage = new AlphaVantage('YOUR_API_KEY');
    for (const stockSymbol of this.stockSymbols) {
      const response = await alphaVantage.getQuote(stockSymbol);
      this.realTimeData[stockSymbol] = response.data;
    }
  }

  renderHistoricalDataChart() {
    const chart = new Chart('historical-data-chart', {
      type: 'line',
      data: {
        labels: Object.keys(this.historicalData),
        datasets: Object.values(this.historicalData).map((data) => ({
          label: data.symbol,
          data: data.values.map((value) => value.close),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        })),
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
  }

  renderRealTimeDataChart() {
    const chart = new Chart('real-time-data-chart', {
      type: 'line',
      data: {
        labels: Object.keys(this.realTimeData),
        datasets: Object.values(this.realTimeData).map((data) => ({
          label: data.symbol,
          data: [data.price],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        })),
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
  }
}

// Create stock market data visualization tool
const stockMarketDataVisualizationTool = new StockMarketDataVisualizationTool();

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

  socket.on('fetch-historical-data', async () => {
    await stockMarketDataVisualizationTool.fetchHistoricalData();
    socket.emit('historical-data', stockMarketDataVisualizationTool.historicalData);
  });

  socket.on('fetch-real-time-data', async () => {
    await stockMarketDataVisualizationTool.fetchRealTimeData();
    socket.emit('real-time-data', stockMarketDataVisualizationTool.realTimeData);
  });

  socket.on('render-historical-data-chart', () => {
    stockMarketDataVisualizationTool.renderHistoricalDataChart();
  });

  socket.on('render-real-time-data-chart', () => {
    stockMarketDataVisualizationTool.renderRealTimeDataChart();
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});