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

// debugging
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log(
  "AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID ? "*****" : "Missing"
);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "*****" : "Missing"
);

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
