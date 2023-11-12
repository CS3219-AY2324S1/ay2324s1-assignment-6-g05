import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import bodyParser from "body-parser";
import HttpStatusCode from "./lib/enums/HttpStatusCode";
import cors, { corsOptions } from "./middleware/cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketHandler } from "./controllers";
import logger from './lib/utils/logger';
import SocketEvent from "./lib/enums/SocketEvent";
import PinoHttp from "pino-http";

dotenv.config();

const app = express();
const expressLogger = PinoHttp({ logger });


// Use the logger middleware
app.use(expressLogger);

// implement cors for CORS protection
app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());

// implement routes for API endpoints
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use(`/matching/api`, router);

app.all("*", (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
  path: `/matching/socket`,
  allowUpgrades: false
});

// Socket handlers
io.on(SocketEvent.CONNECTED, SocketHandler);
io.on(SocketEvent.CONNECTION_ERROR, (error) => {
  logger.error(error, 'Connection error..');
});

const PORT = process.env.SERVICE_PORT || 5200;
const LOG_LEVEL = process.env.LOG_LEVEL || 'default';
const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || 'default';
const MATCHING_TIMEOUT = process.env.MATCHING_TIMEOUT || 'default';

httpServer.listen(PORT, () => {
  logger.info(
    `Server running at port[${PORT}] build[${NODE_ENV}] log[${LOG_LEVEL}] cors[${CORS_ALLOWED_ORIGINS}] timeout[${MATCHING_TIMEOUT}]`
  );
});

export { io };