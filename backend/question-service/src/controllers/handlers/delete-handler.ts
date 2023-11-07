import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../models/db";
import logger from "../../lib/utils/logger";

// Deletes a question from database based on questionId
export const deleteQuestion = async (request: Request, response: Response) => {
  try {
    const { questionId } = request.params;

    // Find the question to delete in the database
    const questionExist = await db.question.findFirst({
      where: {
        id: questionId,
      },
    });

    if (!questionExist) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: `Question with id ${questionId} not found.`,
      });
      return;
    }

    // delete the question from database
    await db.question.delete({
      where: {
        id: questionId,
      },
    });

    response.status(HttpStatusCode.NO_CONTENT).send();
  } catch (error) {
    // log the error
    logger.error(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};
