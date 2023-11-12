import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import bodyParser from "body-parser";
import HttpStatusCode from "./common/HttpStatusCode";
import cors from "./middleware/cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./config/passport";

dotenv.config();

const app: Express = express();

// implement cors for CORS protection
// app.use(cors);

// implement body-parser for parsing request body
app.use(bodyParser.json());
app.use(cookieParser());

app.use(passport.initialize());

// implement routes for API endpoints
const NODE_ENV = process.env.NODE_ENV || "development";
app.use(`/auth/api`, router);

app.all("*", (_: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: "NOT FOUND",
    message: "The requested resource could not be found.",
  });
});

const PORT = process.env.SERVICE_PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server listens on port ${PORT} build[${NODE_ENV}] user_gateway[${process.env.USER_GATEWAY}]`);
});
