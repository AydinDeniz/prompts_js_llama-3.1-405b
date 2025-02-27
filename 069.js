// Import required libraries
const express = require('express');
const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Graph } = require('graphlib');
const { Dijkstra } = require('dijkstra');

// Define grocery list optimizer
class GroceryListOptimizer {
  constructor() {
    this.storeLayout = {};
    this.itemAvailability = {};
    this.groceryList = [];
  }

  async getStoreLayout() {
    const response = await fetch('https://example.com/store-layout.json');
    const storeLayout = await response.json();
    this.storeLayout = storeLayout;
  }

  async getItemAvailability() {
    const response = await fetch('https://example.com/item-availability.json');
    const itemAvailability = await response.json();
    this.itemAvailability = itemAvailability;
  }

  optimizeGroceryList() {
    const graph = new Graph();
    Object.keys(this.storeLayout).forEach((aisle) => {
      graph.setNode(aisle);
      this.storeLayout[aisle].forEach((item) => {
        graph.setEdge(aisle, item, 1);
      });
    });
    const dijkstra = new Dijkstra(graph);
    const optimizedList = [];
    this.groceryList.forEach((item) => {
      const shortestPath = dijkstra.shortestPath(item);
      optimizedList.push(...shortestPath);
    });
    return optimizedList;
  }

  planRoute() {
    const optimizedList = this.optimizeGroceryList();
    const route = [];
    optimizedList.forEach((item) => {
      const aisle = this.storeLayout[item];
      if (!route.includes(aisle)) {
        route.push(aisle);
      }
    });
    return route;
  }
}

// Create grocery list optimizer
const groceryListOptimizer = new GroceryListOptimizer();

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

  socket.on('get-store-layout', async () => {
    await groceryListOptimizer.getStoreLayout();
    socket.emit('store-layout', groceryListOptimizer.storeLayout);
  });

  socket.on('get-item-availability', async () => {
    await groceryListOptimizer.getItemAvailability();
    socket.emit('item-availability', groceryListOptimizer.itemAvailability);
  });

  socket.on('optimize-grocery-list', () => {
    const optimizedList = groceryListOptimizer.optimizeGroceryList();
    socket.emit('optimized-grocery-list', optimizedList);
  });

  socket.on('plan-route', () => {
    const route = groceryListOptimizer.planRoute();
    socket.emit('route', route);
  });
});

// Start server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});