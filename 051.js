// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { Chart } = require('chart.js');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/expenses', { useNewUrlParser: true, useUnifiedTopology: true });

// Define expense model
const expenseSchema = new mongoose.Schema({
  date: Date,
  category: String,
  amount: Number,
  description: String,
});
const Expense = mongoose.model('Expense', expenseSchema);

// Define API endpoint for adding transactions
app.post('/add-transaction', (req, res) => {
  const expense = new Expense(req.body);
  expense.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Transaction added successfully' });
    }
  });
});

// Define API endpoint for categorizing expenses
app.get('/categories', (req, res) => {
  const categories = ['Food', 'Transportation', 'Entertainment', 'Housing', 'Utilities'];
  res.json(categories);
});

// Define API endpoint for generating reports
app.get('/report', (req, res) => {
  const report = {};
  Expense.find({}, (err, expenses) => {
    if (err) {
      console.error(err);
    } else {
      expenses.forEach((expense) => {
        if (!report[expense.category]) {
          report[expense.category] = 0;
        }
        report[expense.category] += expense.amount;
      });
      res.json(report);
    }
  });
});

// Define API endpoint for visualizing data with charts
app.get('/chart', (req, res) => {
  const chartData = [];
  Expense.find({}, (err, expenses) => {
    if (err) {
      console.error(err);
    } else {
      expenses.forEach((expense) => {
        chartData.push({ date: expense.date, amount: expense.amount });
      });
      const chart = new Chart('chart', {
        type: 'line',
        data: {
          labels: chartData.map((data) => data.date),
          datasets: [{
            label: 'Expenses',
            data: chartData.map((data) => data.amount),
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
    }
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

  socket.on('add-transaction', (transaction) => {
    const expense = new Expense(transaction);
    expense.save((err) => {
      if (err) {
        console.error(err);
      } else {
        socket.emit('transaction-added', { message: 'Transaction added successfully' });
      }
    });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});