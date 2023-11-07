import { Request, Response } from "express";
import { ZodError } from "zod";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import { CreateHistoryBodyValidator } from "../../lib/validators/CreateHistoryBodyValidator";
import db from "../../lib/db";

export async function postHistory(request: Request, response: Response) {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is required",
      });
      return;
    }

    // check request body correctness
    const createHistoryBody = CreateHistoryBodyValidator.parse(request.body);

    // check if request body contains extra fields
    const inputBodyKeys = Object.keys(request.body).sort();
    const parsedBodyKeys = Object.keys(createHistoryBody).sort();

    if (JSON.stringify(inputBodyKeys) !== JSON.stringify(parsedBodyKeys)) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Invalid properties in request body",
      });
      return;
    }

    // verify the user id exists
    let userList = Array.isArray(createHistoryBody.userId)
      ? createHistoryBody.userId
      : [createHistoryBody.userId];

    for (let i = 0; i < userList.length; i++) {
      const user = await db.user.findFirst({
        where: {
          id: userList[i],
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        response.status(HttpStatusCode.NOT_FOUND).json({
          error: "NOT FOUND",
          message: "User id cannot be found",
        });
        return;
      }
    }

    // verify the question id exists
    const question = await db.question.findFirst({
      where: {
        id: createHistoryBody.questionId,
      },
      select: {
        id: true,
      },
    });

    if (!question) {
      response.status(HttpStatusCode.NOT_FOUND).json({
        error: "NOT FOUND",
        message: "Question id cannot be found",
      });
      return;
    }

    // check if history already exists
    let isDuplicatedHistory = false;

    for (let i = 0; i < userList.length; i++) {
      const history = await db.history.findFirst({
        where: {
          userId: userList[i],
          questionId: createHistoryBody.questionId,
        },
        select: {
          id: true,
          languages: true,
        },
      });

      if (history) {
        // check if language already exists
        if (!history.languages.includes(createHistoryBody.language)) {
          // update history record
          await db.history.update({
            where: {
              id: history.id,
            },
            data: {
              languages: {
                push: createHistoryBody.language,
              },
            },
          });

          // create new code submission record for the new language
          if (createHistoryBody.code) {
            await db.codeSubmission.create({
              data: {
                historyId: history.id,
                language: createHistoryBody.language,
                code: createHistoryBody.code,
              },
            });
          }
        } else {
          isDuplicatedHistory = true;
          break;
        }
        // remove user id from userList
        userList.splice(i, 1);
        i--;
      }
    }

    if (isDuplicatedHistory) {
      response.status(HttpStatusCode.CONFLICT).json({
        error: "CONFLICT",
        message: "History already exists",
      });
      return;
    }

    // create history record
    const createHistoryPromises: any[] = [];
    userList.map((userId) => {
      createHistoryPromises.push(
        db.history.create({
          data: {
            userId: userId,
            questionId: createHistoryBody.questionId,
            languages: [createHistoryBody.language],
          },
        })
      );
    });

    const historyResponses = await Promise.all(createHistoryPromises);

    if (createHistoryBody.code) {
      const createCodePromises: any[] = [];
      historyResponses.map((historyResponse) => {
        createCodePromises.push(
          db.codeSubmission.create({
            data: {
              historyId: historyResponse.id,
              language: createHistoryBody.language,
              code: createHistoryBody.code!,
            },
          })
        );
      });

      await Promise.all(createCodePromises);
    }

    response.status(HttpStatusCode.CREATED).json({
      message: "History created successfully",
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
      message: "An unexpected error has occurred",
    });
  }
}
