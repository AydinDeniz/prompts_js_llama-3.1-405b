class TaskQueue {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.queue = [];
    this.activeTasks = 0;
  }

  async enqueue(task) {
    this.queue.push(task);
    this.processQueue();
  }

  async processQueue() {
    if (this.activeTasks >= this.maxConcurrency) return;
    const task = this.queue.shift();
    if (!task) return;
    this.activeTasks++;
    try {
      await task();
    } catch (error) {
      console.error(error);
    } finally {
      this.activeTasks--;
      this.processQueue();
    }
  }
}

// Example usage:
const taskQueue = new TaskQueue(3);

const task1 = async () => {
  console.log('Task 1 started');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('Task 1 completed');
};

const task2 = async () => {
  console.log('Task 2 started');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Task 2 completed');
};

const task3 = async () => {
  console.log('Task 3 started');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Task 3 completed');
};

const task4 = async () => {
  console.log('Task 4 started');
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log('Task 4 completed');
};

const task5 = async () => {
  console.log('Task 5 started');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('Task 5 completed');
};

taskQueue.enqueue(task1);
taskQueue.enqueue(task2);
taskQueue.enqueue(task3);
taskQueue.enqueue(task4);
taskQueue.enqueue(task5);