import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { QueryParamValidator } from "../../lib/validators/QueryParamValidator";
import db from "../../models/db";
import { ZodError } from "zod";
import { formatErrorMessage } from "../../lib/utils/errorUtils";
import Topic from "../../lib/enums/Topic";
import Complexity from "../../lib/enums/Complexity";
import { Example } from "../../models/question";
import logger from "../../lib/utils/logger";

// Check if database connection is successful
export const getHealth = async (_: Request, response: Response) => {
  try {
    const result = await db.$queryRaw`SELECT 1`;

    if (!result) {
      throw new Error("No database connection from the server");
    }

    response.status(HttpStatusCode.OK).json({ message: "Healthy" });
  } catch (error) {
    logger.error(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "No database connection from the server",
    });
  }
};

type Filter = {
  topics?: string[];
  difficulties?: string[];
  author?: string;
};

// Query mulitple questions from database by filter
export const getQuestions = async (request: Request, response: Response) => {
  try {
    // check if there are any query params provided and the provided values are valid
    const { topic, complexity, author } = QueryParamValidator.parse(
      request.query
    );

    const filter: Filter = constructRequestFilter(topic, complexity, author);

    const questions = await db.question.findMany({
      where: {
        ...(filter.topics && { topics: { hasSome: filter.topics } }),
        ...(filter.difficulties && { complexity: { in: filter.difficulties } }),
        ...(filter.author && { author: filter.author }),
      },
      select: {
        id: true,
        title: true,
        topics: true,
        complexity: true,
      },
    });

    if (!questions || questions.length == 0) {
      response
        .status(HttpStatusCode.NOT_FOUND)
        .json({ error: "NOT FOUND", message: "No questions found" });
      return;
    }

    response
      .status(HttpStatusCode.OK)
      .json({ count: questions.length, data: questions });
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

// Query unique question from database by questionId
export const getQuestionById = async (request: Request, response: Response) => {
  try {
    const { questionId } = request.params;

    const question = await db.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      response
        .status(HttpStatusCode.NOT_FOUND)
        .json({ error: "NOT FOUND", message: "Question not found." });
      return;
    }

    // get examples if any
    const examples = (await db.example.findMany({
      where: {
        questionId: questionId,
      },
      select: {
        input: true,
        output: true,
        explanation: true,
      },
    })) as Example[];

    // exclude explanation field if it is null
    examples.forEach((example) => {
      if (!example.explanation) {
        delete example.explanation;
      }
    });

    response.status(HttpStatusCode.OK).json({ ...question, examples });
  } catch (error) {
    // log the error
    logger.error(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};

export const getQuestionTopics = (_: Request, response: Response) => {
  try {
    const topics = Object.values(Topic);
    response.status(HttpStatusCode.OK).json({ topics });
  } catch (error) {
    // log the error
    logger.error(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};

function constructRequestFilter(
  topics: Topic | Topic[] | undefined,
  difficulties: Complexity | Complexity[] | undefined,
  author: string | undefined
) {
  const filter: Filter = {};

  if (topics) {
    if (Array.isArray(topics)) {
      // convert each topic to a string from enum
      filter.topics = topics.map((topic) => topic.toString());
    } else {
      filter.topics = [topics.toString()];
    }
  }

  if (difficulties) {
    if (Array.isArray(difficulties)) {
      filter.difficulties = difficulties.map((difficulty) =>
        difficulty.toString()
      );
    } else {
      filter.difficulties = [difficulties.toString()];
    }
  }

  if (author) {
    filter.author = author;
  }

  return filter;
}
