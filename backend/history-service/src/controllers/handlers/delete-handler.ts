import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../lib/db";

export async function deleteHistory(request: Request, response: Response) {
  try {
    const { userId, questionId } = request.params;

    // check if the history exists
    const history = await db.history.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
      select: {
        id: true,
      },
    });

    if (!history) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "The history record does not exist",
      });
      return;
    }

    // delete the history
    await db.history.delete({
      where: {
        id: history.id,
      },
    });

    response.status(HttpStatusCode.NO_CONTENT).send();
  } catch (error) {
    // log the error
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred",
    });
  }
}
