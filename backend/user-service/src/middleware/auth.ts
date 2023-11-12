import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../lib/enums/HttpStatusCode";
import dotenv from "dotenv";

dotenv.config();
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug(`[${req.url}][${req.method}] ${JSON.stringify(req.params)}\n${JSON.stringify(req.body)}`);
  if (req.headers.bypass) {
    const serviceSecret = process.env.SERVICE_SECRET || "secret";
    // bypass auth for calls from auth service
    if (req.headers.bypass === serviceSecret) {
      next();
      return;
    }
  }

  if (req.url === "/health") {
    next();
    return;
  }

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

  const AUTH_GATEWAY = process.env.AUTH_GATEWAY || "http://localhost:5050"
  //If there is JWT, validate it through the auth endpoint
  const authEndpoint =
    process.env.AUTH_ENDPOINT || `auth/api/validate`;

  const authRes = await fetch(`${AUTH_GATEWAY}/${authEndpoint}`, {
    method: "POST",
    headers: {
      Cookie: `jwt=${jwtCookieString}`,
    },
  });
  
  console.debug(`[authMiddle][${authRes.status}] fetch ${AUTH_GATEWAY}/${authEndpoint}`);
  if (authRes.status !== HttpStatusCode.OK) {
    const message = await authRes.text();
    res.status(authRes.status).json({
      error: message,
      message,
    });
    return;
  }

  next();
};
