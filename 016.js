// Import required libraries
const express = require('express');
const app = express();
const pg = require('pg');
const bodyParser = require('body-parser');

// Set up PostgreSQL database connection
const db = new pg.Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error('connection error', err);
  } else {
    console.log('connected');
  }
});

// Set up Node.js API
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a new poll
app.post('/polls', (req, res) => {
  const { title, options } = req.body;
  const query = {
    text: `INSERT INTO polls (title, options) VALUES ($1, $2) RETURNING *`,
    values: [title, options],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error creating poll' });
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Get all polls
app.get('/polls', (req, res) => {
  const query = {
    text: 'SELECT * FROM polls',
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting polls' });
    } else {
      res.send(result.rows);
    }
  });
});

// Get a specific poll
app.get('/polls/:id', (req, res) => {
  const id = req.params.id;
  const query = {
    text: 'SELECT * FROM polls WHERE id = $1',
    values: [id],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting poll' });
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Vote on a poll
app.post('/polls/:id/votes', (req, res) => {
  const id = req.params.id;
  const { option } = req.body;
  const query = {
    text: `INSERT INTO votes (poll_id, option) VALUES ($1, $2) RETURNING *`,
    values: [id, option],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error voting on poll' });
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Get the results of a poll
app.get('/polls/:id/results', (req, res) => {
  const id = req.params.id;
  const query = {
    text: `SELECT option, COUNT(*) as count FROM votes WHERE poll_id = $1 GROUP BY option`,
    values: [id],
  };
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting poll results' });
    } else {
      res.send(result.rows);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Front-end JavaScript code
const pollForm = document.getElementById('poll-form');
const pollTitleInput = document.getElementById('poll-title');
const pollOptionsInput = document.getElementById('poll-options');
const voteForm = document.getElementById('vote-form');
const voteOptionInput = document.getElementById('vote-option');
const resultsContainer = document.getElementById('results-container');

// Create a new poll
pollForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = pollTitleInput.value;
  const options = pollOptionsInput.value.split(',');
  fetch('/polls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, options }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
});

// Vote on a poll
voteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const option = voteOptionInput.value;
  const pollId = voteForm.dataset.pollId;
  fetch(`/polls/${pollId}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
});

// Get the results of a poll
fetch('/polls/1/results')
  .then((res) => res.json())
  .then((data) => {
    const resultsHtml = data.map((result) => `<p>${result.option}: ${result.count}</p>`).join('');
    resultsContainer.innerHTML = resultsHtml;
  })
  .catch((err) => console.error(err));