import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { ZodError } from "zod";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import db from "../../lib/db";
import { CodeSubmissionBodyValidator } from "../../lib/validators/CodeSubmissionBodyValidator";

export async function updateQuestionCodeSubmission(
  request: Request,
  response: Response
) {
  try {
    // retrieve user id and question id
    const { userId, questionId } = request.params;

    // check if request body is empty
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is required",
      });
      return;
    }

    // check request body correctness
    const updateQuestionCodeSubmissionBody = CodeSubmissionBodyValidator.parse(
      request.body
    );

    // check if request body contains extra fields
    const inputBodyKeys = Object.keys(request.body).sort();
    const parsedBodyKeys = Object.keys(updateQuestionCodeSubmissionBody).sort();

    if (JSON.stringify(inputBodyKeys) !== JSON.stringify(parsedBodyKeys)) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Invalid properties in request body",
      });
      return;
    }

    // verify the user id exists
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "User does not exist",
      });
      return;
    }

    // verify the question id exists
    const question = await db.question.findFirst({
      where: {
        id: questionId,
      },
      select: {
        id: true,
      },
    });

    if (!question) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "Question does not exist",
      });
      return;
    }

    // check if the history exists
    const history = await db.history.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
      select: {
        id: true,
        languages: true,
      },
    });

    if (!history) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "History does not exist",
      });
      return;
    } else if (
      !history.languages.includes(updateQuestionCodeSubmissionBody.language)
    ) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message:
          "Code submission does not exist, use the POST endpoint instead",
      });
      return;
    }

    // update the code submission
    await db.codeSubmission.update({
      where: {
        historyId_language: {
          historyId: history.id,
          language: updateQuestionCodeSubmissionBody.language,
        },
      },
      data: {
        code: updateQuestionCodeSubmissionBody.code,
      },
    });

    response.status(HttpStatusCode.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ZodError) {
      response
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: "BAD REQUEST", message: formatErrorMessage(error) });
      return;
    }
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred",
    });
  }
}
