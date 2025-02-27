// Import required libraries
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema } = require('graphql');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true });

// Define GraphQL schema
const schema = new GraphQLSchema({
  typeDefs: `
    type Product {
      id: ID!
      name: String!
      price: Float!
    }

    type Order {
      id: ID!
      productId: ID!
      customerId: ID!
    }

    type Customer {
      id: ID!
      name: String!
      email: String!
    }

    type Query {
      products: [Product]
      orders: [Order]
      customers: [Customer]
    }

    type Mutation {
      createProduct(name: String!, price: Float!): Product
      createOrder(productId: ID!, customerId: ID!): Order
      createCustomer(name: String!, email: String!): Customer
    }
  `,
  resolvers: {
    Query: {
      products: () => Product.find(),
      orders: () => Order.find(),
      customers: () => Customer.find(),
    },
    Mutation: {
      createProduct: (parent, { name, price }) => {
        const product = new Product({ name, price });
        return product.save();
      },
      createOrder: (parent, { productId, customerId }) => {
        const order = new Order({ productId, customerId });
        return order.save();
      },
      createCustomer: (parent, { name, email }) => {
        const customer = new Customer({ name, email });
        return customer.save();
      },
    },
  },
});

// Define Mongoose models
const Product = mongoose.model('Product', {
  name: String,
  price: Number,
});

const Order = mongoose.model('Order', {
  productId: String,
  customerId: String,
});

const Customer = mongoose.model('Customer', {
  name: String,
  email: String,
});

// Create Express server
const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Define real-time notifications
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('newOrder', (order) => {
    io.emit('newOrder', order);
  });
});

// Start server
httpServer.listen(3000, () => {
  console.log('Server listening on port 3000');
});