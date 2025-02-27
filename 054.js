// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const { InstagramGraphApi } = require('instagram-graph-api');

// Define Twitter API credentials
const twitterApiKey = 'YOUR_TWITTER_API_KEY';
const twitterApiSecret = 'YOUR_TWITTER_API_SECRET';
const twitterAccessToken = 'YOUR_TWITTER_ACCESS_TOKEN';
const twitterAccessTokenSecret = 'YOUR_TWITTER_ACCESS_TOKEN_SECRET';

// Define Instagram API credentials
const instagramClientId = 'YOUR_INSTAGRAM_CLIENT_ID';
const instagramClientSecret = 'YOUR_INSTAGRAM_CLIENT_SECRET';
const instagramAccessToken = 'YOUR_INSTAGRAM_ACCESS_TOKEN';

// Initialize Twitter API
const twitterApi = new TwitterApi(twitterApiKey, twitterApiSecret, twitterAccessToken, twitterAccessTokenSecret);

// Initialize Instagram API
const instagramApi = new InstagramGraphApi(instagramClientId, instagramClientSecret, instagramAccessToken);

// Define API endpoint for Twitter data
app.get('/twitter-data', (req, res) => {
  const username = req.query.username;
  const tweets = twitterApi.v2.get(`users/${username}/tweets`, {
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'text'],
  });
  res.json(tweets);
});

// Define API endpoint for Instagram data
app.get('/instagram-data', (req, res) => {
  const username = req.query.username;
  const posts = instagramApi.get(`/${username}/media`, {
    fields: ['id', 'caption', 'media_url', 'created_time'],
  });
  res.json(posts);
});

// Define API endpoint for user engagement analytics
app.get('/engagement-analytics', (req, res) => {
  const username = req.query.username;
  const tweets = twitterApi.v2.get(`users/${username}/tweets`, {
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'text'],
  });
  const engagement = tweets.data.reduce((acc, tweet) => {
    acc += tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + tweet.public_metrics.reply_count;
    return acc;
  }, 0);
  res.json({ engagement });
});

// Define API endpoint for post sentiment analytics
app.get('/sentiment-analytics', (req, res) => {
  const username = req.query.username;
  const tweets = twitterApi.v2.get(`users/${username}/tweets`, {
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'text'],
  });
  const sentiment = tweets.data.reduce((acc, tweet) => {
    const sentimentScore = analyzeSentiment(tweet.text);
    acc += sentimentScore;
    return acc;
  }, 0);
  res.json({ sentiment });
});

// Define function for sentiment analysis
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent'];
  const negativeWords = ['bad', 'terrible', 'awful'];
  const words = text.split(' ');
  let sentimentScore = 0;
  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      sentimentScore += 1;
    } else if (negativeWords.includes(word)) {
      sentimentScore -= 1;
    }
  });
  return sentimentScore;
}

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

  socket.on('get-twitter-data', (username) => {
    const tweets = twitterApi.v2.get(`users/${username}/tweets`, {
      expansions: ['author_id'],
      'tweet.fields': ['created_at', 'text'],
    });
    socket.emit('twitter-data', tweets);
  });

  socket.on('get-instagram-data', (username) => {
    const posts = instagramApi.get(`/${username}/media`, {
      fields: ['id', 'caption', 'media_url', 'created_time'],
    });
    socket.emit('instagram-data', posts);
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});