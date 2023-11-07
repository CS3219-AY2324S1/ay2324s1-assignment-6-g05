import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import {
  UpdateQuestionRequestBody,
  UpdateQuestionValidator,
} from "../../lib/validators/UpdateQuestionValidator";
import { ZodError } from "zod";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import db from "../../models/db";
import logger from "../../lib/utils/logger";

export const updateQuestion = async (request: Request, response: Response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      return;
    }

    const { questionId } = request.params;

    const question = await db.question.findFirst({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: `Question with id ${questionId} not found.`,
      });
      return;
    }

    const updatedQuestionBody: UpdateQuestionRequestBody =
      UpdateQuestionValidator.parse(request.body);

    // Check no existing question with the same question name in the database
    if (updatedQuestionBody.title) {
      const existingNameQuestion = await db.question.findFirst({
        where: {
          title: updatedQuestionBody.title,
          id: {
            not: questionId,
          },
        },
      });

      if (existingNameQuestion) {
        response.status(HttpStatusCode.CONFLICT).json({
          error: "CONFLICT",
          message: "Question title already exists",
        });
        return;
      }
    }

    // update question in database
    await db.question.update({
      where: {
        id: questionId,
      },
      data: {
        title: updatedQuestionBody.title,
        description: updatedQuestionBody.description,
        topics: updatedQuestionBody.topics,
        complexity: updatedQuestionBody.complexity,
        url: updatedQuestionBody.url,
        author: updatedQuestionBody.author,
        constraints: updatedQuestionBody.constraints,
      },
    });

    if (
      updatedQuestionBody.examples &&
      updatedQuestionBody.examples.length > 0
    ) {
      // delete existing examples
      await db.example.deleteMany({
        where: {
          questionId: questionId,
        },
      });

      // insert new examples
      await db.example.createMany({
        data: updatedQuestionBody.examples.map((example) => ({
          questionId: questionId,
          input: example.input,
          output: example.output,
          explanation: example.explanation,
        })),
      });
    }

    response.status(HttpStatusCode.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(error.message);
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
