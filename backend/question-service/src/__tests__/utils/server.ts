import express from "express";
import cors from "../../middleware/cors";
import bodyParser from "body-parser";
import router from "../../routes";

import * as dotenv from "dotenv";

dotenv.config();

export default function createUnitTestServer() {
  const app = express();

  // implement cors for CORS protection
  app.use(cors);

  // implement body-parser for parsing request body
  app.use(bodyParser.json());

  // implement routes for API endpoints
  
  app.use(`/question/api`, router);

  return app;
}
