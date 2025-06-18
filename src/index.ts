import express, { Request, Response } from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid"; // uuid for unique ID generation

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// init dynamodb
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const validateTaskInput = (body: any): { valid: boolean; error?: string } => {
  if (!body.title || typeof body.title !== "string") {
    return { valid: false, error: 'Invalid or missing "title" field' };
  }
  return { valid: true };
};

// handle and log internal error
const sendServerError = (res: Response, error: unknown) => {
  console.error("Internal server error:", error);
  res.status(500).send("Internal Server Error");
};

// create task
app.post("/tasks", async (req: Request, res: Response): Promise<void> => {
  const { title } = req.body;

  const validation = validateTaskInput(req.body);
  if (!validation.valid) {
    res.status(400).send(validation.error);
    return;
  }

  const newTask = {
    id: uuidv4(),
    title,
    completed: false,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: "Tasks",
        Item: newTask,
      })
    );

    void res.status(201).json(newTask);
  } catch (error) {
    sendServerError(res, error);
  }
});

// get all tasks
app.get("/tasks", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await docClient.send(
      new ScanCommand({
        TableName: "Tasks",
      })
    );

    void res.json(data.Items || []);
  } catch (error) {
    sendServerError(res, error);
  }
});

// get single task by id
app.get("/tasks/:id", async (req: Request, res: Response): Promise<void> => {
  const taskId = req.params.id;

  try {
    const data = await docClient.send(
      new GetCommand({
        TableName: "Tasks",
        Key: { id: taskId },
      })
    );

    if (!data.Item) {
      void res.status(404).send("Task not found");
      return;
    }

    void res.json(data.Item);
  } catch (error) {
    sendServerError(res, error);
  }
});

// update task
app.put("/tasks/:id", async (req: Request, res: Response): Promise<void> => {
  const taskId = req.params.id;
  const { title, completed } = req.body;

  try {
    const updateParams: any = {
      TableName: "Tasks",
      Key: { id: taskId },
      UpdateExpression: "SET",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    if (title !== undefined) {
      updateParams.UpdateExpression += " #title = :title,";
      updateParams.ExpressionAttributeNames["#title"] = "title";
      updateParams.ExpressionAttributeValues[":title"] = title;
    }

    if (completed !== undefined) {
      updateParams.UpdateExpression += " completed = :completed,";
      updateParams.ExpressionAttributeValues[":completed"] = completed;
    }

    // remove coma trail
    updateParams.UpdateExpression = updateParams.UpdateExpression.replace(
      /,$/,
      ""
    );

    const data = await docClient.send(new UpdateCommand(updateParams));

    if (!data.Attributes) {
      void res.status(404).send("Task not found");
      return;
    }

    void res.json(data.Attributes);
  } catch (error) {
    sendServerError(res, error);
  }
});

// delete task
app.delete("/tasks/:id", async (req: Request, res: Response): Promise<void> => {
  const taskId = req.params.id;

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: "Tasks",
        Key: { id: taskId },
      })
    );

    void res.status(204).send();
  } catch (error) {
    sendServerError(res, error);
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
