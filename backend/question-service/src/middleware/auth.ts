import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../lib/enums/HttpStatusCode";
import dotenv from "dotenv";
import logger from "../lib/utils/logger";

dotenv.config();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.url === "/health") {
    next();
    return;
  }
  // Only allow GET requests to /question/questions to pass through with just user rights
  const cookies = req.headers.cookie;
  
  const jwtCookieString = cookies
  ?.split(";")
  .find((cookie) => cookie.split("=")[0].trim() == "jwt")
  ?.split("=")[1];
  
  //If there is no JWT, do not need to go through auth
  if (!jwtCookieString) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({
      error: "Unauthorised",
      message: "Unauthorised",
    });
    return;
  }
  
  // Only allow GET requests to /development/user/questions to pass through with just user rights
  const AUTH_GATEWAY = process.env.AUTH_GATEWAY || "http://localhost:5050"
  const authEndpoint =
    req.method === "GET"
      ? process.env.AUTH_ENDPOINT || `auth/api/validate`
      : process.env.AUTH_ADMIN_ENDPOINT ||
      `auth/api/validateAdmin`;

  try {
    const authRes = await fetch(`${AUTH_GATEWAY}/${authEndpoint}`, {
      method: "POST",
      headers: {
        Cookie: `jwt=${jwtCookieString}`,
      },
    });

    if (authRes.status === HttpStatusCode.OK) {
      next();
    }

    if (authRes.status === HttpStatusCode.UNAUTHORIZED) {
      const message = await authRes.text();
      res.status(authRes.status).json({
        error: message,
        message,
      });
      return;
    }

    if (
      authRes.status === HttpStatusCode.FORBIDDEN ||
      authRes.status === HttpStatusCode.INTERNAL_SERVER_ERROR
    ) {
      const message = await authRes.json();
      res.status(authRes.status).json(message);
      return;
    }
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "Authorization service is unreachable",
    });
    return;
  }
};
