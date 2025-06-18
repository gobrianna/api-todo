import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Task } from "../types/task";

// dynamodb client config
const dynamoDBClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
  { marshallOptions: { removeUndefinedValues: true } } // auto-remove undefined fields
);

type TaskUpdate = Partial<Pick<Task, "title" | "completed">>;

export const createTask = async (title: string): Promise<Task> => {
  const newTask: Task = {
    id: uuidv4(),
    title,
    completed: false,
  };

  await dynamoDBClient.send(
    new PutCommand({
      TableName: "Tasks",
      Item: newTask,
    })
  );

  return newTask;
};

export const getAllTasks = async (): Promise<Task[]> => {
  const { Items } = await dynamoDBClient.send(
    new ScanCommand({
      TableName: "Tasks",
    })
  );

  return (Items as Task[]) ?? [];
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const { Item } = await dynamoDBClient.send(
    new GetCommand({
      TableName: "Tasks",
      Key: { id },
    })
  );

  return Item as Task | null;
};

export const updateTask = async (
  id: string,
  updates: TaskUpdate
): Promise<Task | null> => {
  let UpdateExpression = "SET";
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, any> = {};

  if (updates.title !== undefined) {
    UpdateExpression += " #title = :title,";
    ExpressionAttributeNames["#title"] = "title";
    ExpressionAttributeValues[":title"] = updates.title;
  }

  if (updates.completed !== undefined) {
    UpdateExpression += " completed = :completed,";
    ExpressionAttributeValues[":completed"] = updates.completed;
  }

  UpdateExpression = UpdateExpression.slice(0, -1); // remove coma trail

  const { Attributes } = await dynamoDBClient.send(
    new UpdateCommand({
      TableName: "Tasks",
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return Attributes as Task | null;
};

export const deleteTask = async (id: string): Promise<void> => {
  await dynamoDBClient.send(
    new DeleteCommand({
      TableName: "Tasks",
      Key: { id },
    })
  );
};
