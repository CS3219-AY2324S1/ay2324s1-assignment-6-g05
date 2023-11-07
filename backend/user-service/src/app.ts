import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import bodyParser from "body-parser";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import cors from "./middleware/cors";
import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app: Express = express();

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());

app.use(express.json());

// implement routes for API endpoints
app.use(`/user/api`, authMiddleware, router);

app.all("*", (_: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

const PORT = process.env.SERVICE_PORT || 5005;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`Server listens on port ${PORT} build[${NODE_ENV}] log[${process.env.LOG_LEVEL}] db[${process.env.DATABASE_URL}] auth_gateway[${process.env.AUTH_GATEWAY}]`);
});

