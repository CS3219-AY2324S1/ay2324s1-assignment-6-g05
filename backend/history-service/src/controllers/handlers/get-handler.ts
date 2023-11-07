import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../lib/db";
import { HistoryQueryParamsValidator } from "../../lib/validators/HistoryQueryParamsValidator";
import { ZodError } from "zod";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import { GetQuestionCodeHistoryParamsValidator } from "../../lib/validators/GetQuestionCodeHistoryParamsValidator";

export async function getHealth(_: Request, response: Response) {
  try {
    const result = await db.$queryRaw`SELECT 1`;

    if (!result) {
      throw new Error("No database connection from the server");
    }

    response.status(HttpStatusCode.OK).json({ message: "Healthy" });
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "No database connection from the server",
    });
  }
}

export async function getHistory(request: Request, response: Response) {
  try {
    const { userId, questionId } = HistoryQueryParamsValidator.parse(
      request.query
    );

    if (!userId && !questionId) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "At least one of userId and questionId is required",
      });
      return;
    }

    const userList = userId
      ? Array.isArray(userId)
        ? userId
        : [userId]
      : null;

    const questionList = questionId
      ? Array.isArray(questionId)
        ? questionId
        : [questionId]
      : null;

    const history = await db.history.findMany({
      where: {
        ...(userList && { userId: { in: userList } }),
        ...(questionList && { questionId: { in: questionList } }),
      },
      select: {
        id: true,
        userId: true,
        questionId: true,
        question: {
          select: {
            title: true,
            topics: true,
            complexity: true,
          },
        },
        languages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!history || history.length === 0) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "No history found",
      });
      return;
    }

    const result = { count: history.length, data: history };

    response.status(HttpStatusCode.OK).json(result);
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

/*
 * Get the code submission history of a question
 * @param uid - the user id
 * @param qid - the question id
 * @param language - the language of the code submission, optional, given as a request query parameter
 */
export async function getQuestionCodeHistory(
  request: Request,
  response: Response
) {
  try {
    const { userId: uid, questionId: qid } = request.params;

    // query params validation
    const { userId, questionId, language } =
      GetQuestionCodeHistoryParamsValidator.parse({
        userId: uid,
        questionId: qid,
        language: request.query.language,
      });

    let codeSubmission:
      | { code: string; language: string }
      | { code: string; language: string }[]
      | null = null;

    // if language is not specified, return all code submissions available
    if (!language) {
      codeSubmission = await db.codeSubmission.findMany({
        where: {
          history: {
            userId,
            questionId,
          },
        },
        select: {
          code: true,
          language: true,
        },
      });
    }
    // if language is provided as an array, return all code submissions of the languages specified
    else if (Array.isArray(language)) {
      const codeSubmissionPromises = language.map((lang) => {
        return db.codeSubmission.findFirst({
          where: {
            history: {
              userId,
              questionId,
            },
            language: lang,
          },
          select: {
            code: true,
            language: true,
          },
        });
      });

      const codeSubmissionResponses = await Promise.all(codeSubmissionPromises);

      codeSubmission = [];

      for (let i = 0; i < codeSubmissionResponses.length; i++) {
        // either one of the code submission is not found, fail the request
        if (codeSubmissionResponses[i]) {
          codeSubmission.push(codeSubmissionResponses[i]!);
        }
      }
    }
    // if language is provided as a single string, return the code submission of the language specified
    else {
      codeSubmission = await db.codeSubmission.findFirst({
        where: {
          history: {
            userId,
            questionId,
          },
          language,
        },
        select: {
          code: true,
          language: true,
        },
      });
    }

    if (
      !codeSubmission ||
      (Array.isArray(codeSubmission) && codeSubmission.length === 0)
    ) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "No code submission found",
      });
      return;
    }

    if (Array.isArray(codeSubmission)) {
      response
        .status(HttpStatusCode.OK)
        .json({ count: codeSubmission.length, data: codeSubmission });
      return;
    }

    response
      .status(HttpStatusCode.OK)
      .json({ language: codeSubmission.language, code: codeSubmission.code });
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
