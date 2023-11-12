import { Response, Request } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import {
  CreateQuestionRequestBody,
  CreateQuestionValidator,
} from "../../lib/validators/CreateQuestionValidator";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import { ZodError } from "zod";
import db from "../../models/db";
import logger from "../../lib/utils/logger";

export const postQuestion = async (request: Request, response: Response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      return;
    }

    const createQuestionBody: CreateQuestionRequestBody =
      CreateQuestionValidator.parse(request.body);

    // Make sure no duplicate question exists by checking the question name in the database
    const existingQuestion = await db.question.findFirst({
      where: {
        title: createQuestionBody.title,
      },
    });

    if (existingQuestion) {
      response
        .status(HttpStatusCode.CONFLICT)
        .json({ error: "CONFLICT", message: "Question title already exists" });
      return;
    }

    // insert new question to database
    const newQuestion = await db.question.create({
      data: {
        title: createQuestionBody.title,
        description: createQuestionBody.description,
        topics: createQuestionBody.topics,
        complexity: createQuestionBody.complexity,
        url: createQuestionBody.url,
        author: createQuestionBody.author,
        constraints: createQuestionBody.constraints,
      },
    });

    // insert examples if any
    if (createQuestionBody.examples && createQuestionBody.examples.length > 0) {
      await db.example.createMany({
        data: createQuestionBody.examples.map((example) => ({
          questionId: newQuestion.id,
          input: example.input,
          output: example.output,
          explanation: example.explanation,
        })),
      });
    }

    response
      .status(HttpStatusCode.CREATED)
      .json({ id: newQuestion.id, message: "Question created." });
  } catch (error) {
    if (error instanceof ZodError) {
      response
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: "BAD REQUEST", message: formatErrorMessage(error) });
      return;
    }
    // log the error
    logger.error(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};
