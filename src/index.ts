import express, { Request, Response } from "express";
import { Task } from "./types";

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// in-memory array task storage
let tasks: Task[] = [];
let currentId = 1;

// creates new task
app.post("/tasks", (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).send('Invalid or missing "title" field');
    return;
  }

  const newTask: Task = {
    id: currentId++,
    title,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// get all tasks
app.get("/tasks", (req: Request, res: Response) => {
  res.json(tasks);
});

// get a single task by ID
app.get("/tasks/:id", (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    res.status(404).send("Task not found");
    return;
  }

  res.json(task);
});

// updates a task by ID
app.put("/tasks/:id", (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, completed } = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    res.status(404).send("Task not found");
    return;
  }

  if (title !== undefined && typeof title !== "string") {
    res.status(400).send('Invalid "title" field');
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).send('Invalid "completed" field');
    return;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
  };

  res.json(tasks[taskIndex]);
});

// delete a single task
app.delete("/tasks/:id", (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    res.status(404).send("Task not found");
    return;
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
