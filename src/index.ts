import express from "express";
import * as dotenv from "dotenv";
import {
  createTaskHandler,
  getAllTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "./controllers/taskController";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// routes
app.post("/tasks", createTaskHandler);
app.get("/tasks", getAllTasksHandler);
app.get("/tasks/:id", getTaskByIdHandler);
app.put("/tasks/:id", updateTaskHandler);
app.delete("/tasks/:id", deleteTaskHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
