import { Request, Response } from "express";
import { CreateUserValidator } from "../../lib/validators/CreateUserValidator";
import { ZodError } from "zod";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../lib/db";
import { formatErrorMessage } from "../../lib/utils/errorUtils";

export const postUser = async (request: Request, response: Response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      return;
    }

    const createUserBody = CreateUserValidator.parse(request.body);

    const inputBodyKeys = Object.keys(request.body).sort();
    const parsedBodyKeys = Object.keys(createUserBody).sort();

    if (JSON.stringify(inputBodyKeys) !== JSON.stringify(parsedBodyKeys)) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Invalid properties in request body.",
      });
      return;
    }

    // check no duplicate email
    const existingUser = await db.user.findFirst({
      where: {
        email: createUserBody.email,
      },
    });

    if (existingUser) {
      response.status(HttpStatusCode.CONFLICT).json({
        error: "CONFLICT",
        message: `User with email ${createUserBody.email} already exists.`,
      });
      return;
    }

    const user = await db.user.create({
      data: createUserBody,
    });

    if (!user) {
      throw new Error("Failed to register user.");
    }

    await db.preferences.create({
      data: {
        userId: user.id,
        languages: [],
        topics: [],
        difficulties: [],
      },
    });

    response.status(HttpStatusCode.CREATED).json({
      id: user.id,
      email: user.email,
      message: "User created.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: formatErrorMessage(error),
      });
      return;
    }
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};
