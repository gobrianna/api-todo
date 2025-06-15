import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// root route
app.get("/", (req: Request, res: Response) => {
  res.send("The Task Management API is up and running!");
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
