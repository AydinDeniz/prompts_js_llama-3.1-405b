// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tasks', { useNewUrlParser: true, useUnifiedTopology: true });

// Define task model
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  priority: String,
  assignedTo: String,
});
const Task = mongoose.model('Task', taskSchema);

// Define API endpoint for task creation
app.post('/tasks', (req, res) => {
  const task = new Task(req.body);
  task.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Task created successfully' });
    }
  });
});

// Define API endpoint for task retrieval
app.get('/tasks', (req, res) => {
  Task.find({}, (err, tasks) => {
    if (err) {
      console.error(err);
    } else {
      res.json(tasks);
    }
  });
});

// Define API endpoint for task update
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  Task.findByIdAndUpdate(taskId, req.body, (err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
});

// Define API endpoint for task deletion
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  Task.findByIdAndDelete(taskId, (err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Task deleted successfully' });
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

  socket.on('create-task', (task) => {
    const newTask = new Task(task);
    newTask.save((err) => {
      if (err) {
        console.error(err);
      } else {
        io.emit('task-created', newTask);
      }
    });
  });

  socket.on('update-task', (taskId, task) => {
    Task.findByIdAndUpdate(taskId, task, (err) => {
      if (err) {
        console.error(err);
      } else {
        io.emit('task-updated', task);
      }
    });
  });

  socket.on('delete-task', (taskId) => {
    Task.findByIdAndDelete(taskId, (err) => {
      if (err) {
        console.error(err);
      } else {
        io.emit('task-deleted', taskId);
      }
    });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});