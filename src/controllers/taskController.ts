import { Request, Response } from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService";

interface CreateTaskRequest {
  title: string;
}

interface UpdateTaskRequest {
  title?: string;
  completed?: boolean;
}

// error response aide
const handleError = (res: Response, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? String(error) : undefined,
  });
};

export const createTaskHandler = async (
  req: Request<{}, {}, CreateTaskRequest>,
  res: Response
): Promise<void> => {
  const { title } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ error: "Whacha wanna add now?" });
    return;
  }

  try {
    const newTask = await createTask(title.trim());
    res.status(201).json(newTask);
  } catch (error) {
    handleError(res, error, "Alright, adding it to the list...");
  }
};

export const getAllTasksHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    handleError(res, error, "Just a moment...");
  }
};

export const getTaskByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const task = await getTaskById(req.params.id);

    if (!task) {
      res.status(404).json({ error: "Can't find it." });
      return;
    }

    res.json(task);
  } catch (error) {
    handleError(res, error, "Lemme find it...");
  }
};

export const updateTaskHandler = async (
  req: Request<{ id: string }, {}, UpdateTaskRequest>,
  res: Response
): Promise<void> => {
  try {
    const updatedTask = await updateTask(req.params.id, req.body);

    if (!updatedTask) {
      res.status(404).json({ error: "Can't find it." });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    handleError(res, error, "Updated!");
  }
};

export const deleteTaskHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    await deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, "Trash.");
  }
};
