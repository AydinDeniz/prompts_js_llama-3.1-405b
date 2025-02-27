function dijkstra(graph, startNode, endNode) {
  const distances = {};
  const previousNodes = {};
  const unvisitedNodes = new Set(Object.keys(graph));

  for (const node of unvisitedNodes) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  while (unvisitedNodes.size > 0) {
    let currentNode = null;
    for (const node of unvisitedNodes) {
      if (currentNode === null || distances[node] < distances[currentNode]) {
        currentNode = node;
      }
    }

    if (currentNode === endNode) {
      break;
    }

    unvisitedNodes.delete(currentNode);

    for (const neighbor in graph[currentNode]) {
      const distance = graph[currentNode][neighbor];
      const totalDistance = distances[currentNode] + distance;
      if (totalDistance < distances[neighbor]) {
        distances[neighbor] = totalDistance;
        previousNodes[neighbor] = currentNode;
      }
    }
  }

  const path = [];
  let currentNode = endNode;
  while (currentNode !== startNode) {
    path.unshift(currentNode);
    currentNode = previousNodes[currentNode];
  }
  path.unshift(startNode);

  return { distance: distances[endNode], path };
}

// Example usage:
const graph = {
  A: { B: 1, C: 4 },
  B: { A: 1, C: 2, D: 5 },
  C: { A: 4, B: 2, D: 1 },
  D: { B: 5, C: 1 },
};

const result = dijkstra(graph, 'A', 'D');
console.log(`Shortest distance: ${result.distance}`);
console.log(`Shortest path: ${result.path.join(' -> ')}`);