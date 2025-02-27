// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { OperationalTransform } = require('ot');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/documents', { useNewUrlParser: true, useUnifiedTopology: true });

// Define document model
const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  version: Number,
});
const Document = mongoose.model('Document', documentSchema);

// Define API endpoint for document creation
app.post('/documents', (req, res) => {
  const document = new Document(req.body);
  document.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.json({ message: 'Document created successfully' });
    }
  });
});

// Define API endpoint for document retrieval
app.get('/documents/:id', (req, res) => {
  const documentId = req.params.id;
  Document.findById(documentId, (err, document) => {
    if (err) {
      console.error(err);
    } else {
      res.json(document);
    }
  });
});

// Define API endpoint for document update
app.put('/documents/:id', (req, res) => {
  const documentId = req.params.id;
  const updatedContent = req.body.content;
  Document.findById(documentId, (err, document) => {
    if (err) {
      console.error(err);
    } else {
      const ot = new OperationalTransform(document.content, updatedContent);
      const transformedContent = ot.apply();
      document.content = transformedContent;
      document.version++;
      document.save((err) => {
        if (err) {
          console.error(err);
        } else {
          res.json({ message: 'Document updated successfully' });
        }
      });
    }
  });
});

// Define API endpoint for comment creation
app.post('/comments', (req, res) => {
  const comment = req.body;
  const documentId = comment.documentId;
  Document.findById(documentId, (err, document) => {
    if (err) {
      console.error(err);
    } else {
      document.comments.push(comment);
      document.save((err) => {
        if (err) {
          console.error(err);
        } else {
          res.json({ message: 'Comment created successfully' });
        }
      });
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

  socket.on('get-document', (documentId) => {
    Document.findById(documentId, (err, document) => {
      if (err) {
        console.error(err);
      } else {
        socket.emit('document', document);
      }
    });
  });

  socket.on('update-document', (documentId, updatedContent) => {
    Document.findById(documentId, (err, document) => {
      if (err) {
        console.error(err);
      } else {
        const ot = new OperationalTransform(document.content, updatedContent);
        const transformedContent = ot.apply();
        document.content = transformedContent;
        document.version++;
        document.save((err) => {
          if (err) {
            console.error(err);
          } else {
            socket.emit('document-updated', document);
          }
        });
      }
    });
  });

  socket.on('create-comment', (comment) => {
    const documentId = comment.documentId;
    Document.findById(documentId, (err, document) => {
      if (err) {
        console.error(err);
      } else {
        document.comments.push(comment);
        document.save((err) => {
          if (err) {
            console.error(err);
          } else {
            socket.emit('comment-created', comment);
          }
        });
      }
    });
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});