import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../lib/enums/HttpStatusCode";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  //If there is JWT, validate it through the auth endpoint
  const AUTH_GATEWAY = process.env.AUTH_GATEWAY || "http://localhost:5050";
  const authEndpoint = `auth/api/validate`;

  try {
    const authRes = await fetch(`${AUTH_GATEWAY}/${authEndpoint}`, {
      method: "POST",
      headers: {
        Cookie: `jwt=${jwtCookieString}`,
      },
    });

    if (authRes.status !== HttpStatusCode.OK) {
      const message = await authRes.text();
      res.status(authRes.status).json({
        error: message,
        message,
      });
      return;
    }

    next();
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "Authorization service is unreachable",
    });
    return;
  }
};
