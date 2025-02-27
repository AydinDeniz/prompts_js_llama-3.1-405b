// Import required libraries
const express = require('express');
const app = express();
const natural = require('natural');
const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'] });

// Define sentiment analysis function
function sentimentAnalysis(text) {
  const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  const sentiment = analyzer.getSentiment(text);
  return sentiment;
}

// Define NLP model training data
const trainingData = [
  {
    text: 'I am feeling sad',
    intent: 'sadness',
  },
  {
    text: 'I am feeling happy',
    intent: 'happiness',
  },
  {
    text: 'I am feeling anxious',
    intent: 'anxiety',
  },
];

// Train NLP model
trainingData.forEach((data) => {
  manager.addDocument('en', data.text, data.intent);
});
manager.train();

// Define response generation function
function generateResponse(intent) {
  switch (intent) {
    case 'sadness':
      return 'I\'m sorry to hear that you\'re feeling sad. Would you like to talk about what\'s on your mind?';
    case 'happiness':
      return 'That\'s great to hear that you\'re feeling happy! What\'s been going well for you lately?';
    case 'anxiety':
      return 'I understand that you\'re feeling anxious. Have you tried any relaxation techniques such as deep breathing or meditation?';
    default:
      return 'I\'m not sure I understand what you mean. Can you please provide more context?';
  }
}

// Define professional connection function
function connectToProfessional(intent) {
  switch (intent) {
    case 'sadness':
      return 'If you\'re feeling overwhelmed, consider reaching out to a mental health professional. You can find resources at <https://www.nimh.nih.gov/health/find-help/index.shtml>.';
    case 'anxiety':
      return 'If you\'re struggling with anxiety, consider seeking help from a mental health professional. You can find resources at <https://www.nimh.nih.gov/health/find-help/index.shtml>.';
    default:
      return '';
  }
}

// Define API endpoint for user input
app.post('/input', (req, res) => {
  const text = req.body.text;
  const sentiment = sentimentAnalysis(text);
  const intent = manager.process('en', text).intent;
  const response = generateResponse(intent);
  const professionalConnection = connectToProfessional(intent);
  res.json({ sentiment, intent, response, professionalConnection });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});