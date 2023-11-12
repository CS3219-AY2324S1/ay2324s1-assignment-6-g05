import express from "express";
import cors from "../../middleware/cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import router from "../../routes";
import passport from "passport";
import * as dotenv from "dotenv";

export default function createUnitTestServer() {
  dotenv.config();

  const app = express();

  // implement cors for CORS protection
  app.use(cors);

  // implement body-parser for parsing request body
  app.use(bodyParser.json());

  app.use(cookieParser());

  app.use(passport.initialize());

  // implement routes for API endpoints
  app.use(`/auth/api`, router);

  return app;
}
