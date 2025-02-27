// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/language-learning', { useNewUrlParser: true, useUnifiedTopology: true });

// Define language model
const languageSchema = new mongoose.Schema({
  name: String,
  code: String,
});
const Language = mongoose.model('Language', languageSchema);

// Define flashcard model
const flashcardSchema = new mongoose.Schema({
  language: String,
  word: String,
  translation: String,
});
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// Define quiz model
const quizSchema = new mongoose.Schema({
  language: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
});
const Quiz = mongoose.model('Quiz', quizSchema);

// Define question model
const questionSchema = new mongoose.Schema({
  text: String,
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
});
const Question = mongoose.model('Question', questionSchema);

// Define answer model
const answerSchema = new mongoose.Schema({
  text: String,
  correct: Boolean,
});
const Answer = mongoose.model('Answer', answerSchema);

// Define API endpoint for language list
app.get('/languages', (req, res) => {
  Language.find({}, (err, languages) => {
    if (err) {
      console.error(err);
    } else {
      res.json(languages);
    }
  });
});

// Define API endpoint for flashcards
app.get('/flashcards', (req, res) => {
  const language = req.query.language;
  Flashcard.find({ language }, (err, flashcards) => {
    if (err) {
      console.error(err);
    } else {
      res.json(flashcards);
    }
  });
});

// Define API endpoint for quizzes
app.get('/quizzes', (req, res) => {
  const language = req.query.language;
  Quiz.find({ language }, (err, quizzes) => {
    if (err) {
      console.error(err);
    } else {
      res.json(quizzes);
    }
  });
});

// Define API endpoint for pronunciation guides
app.get('/pronunciation', (req, res) => {
  const language = req.query.language;
  const word = req.query.word;
  axios.get(`https://api.forvo.com/api/v2/word-pronunciations?key=${process.env.FORVO_API_KEY}&word=${word}&language=${language}`)
    .then((response) => {
      const pronunciation = response.data.items[0].audio;
      res.json(pronunciation);
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

  socket.on('get-flashcards', (language) => {
    Flashcard.find({ language }, (err, flashcards) => {
      if (err) {
        console.error(err);
      } else {
        socket.emit('flashcards', flashcards);
      }
    });
  });

  socket.on('get-quizzes', (language) => {
    Quiz.find({ language }, (err, quizzes) => {
      if (err) {
        console.error(err);
      } else {
        socket.emit('quizzes', quizzes);
      }
    });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});