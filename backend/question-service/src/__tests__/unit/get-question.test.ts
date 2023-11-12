import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import * as TestPayload from "../utils/payloads";
import Topic from "../../lib/enums/Topic";
import db from "../../models/db";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const API_PREFIX = `question/api`;

describe("GET /questions", () => {
  describe("Given an authorized API call", () => {
    it("should return 200 with questions", async () => {
      // Arrange
      const questions = TestPayload.getQuestionsPayload();

      dbMock.question.findMany = jest.fn().mockResolvedValue(questions);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/questions`
      );

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.OK);
      expect(body).toEqual({ count: 3, data: questions });
    });
  });

  describe("Given a request with invalid query params", () => {
    it("should return 400 with zod error message", async () => {
      // Act
      const { body, statusCode } = await supertest(app)
        .get(`/${API_PREFIX}/questions`)
        .query({ topic: "invalidtopic" });

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
    });
  });
});

describe("GET /questions/:questionId", () => {
  describe("Given an existing question id in the database", () => {
    it("should return 200 with the question", async () => {
      // Arrange
      const questionId = "existingquestionid123";
      const question = TestPayload.getQuestionPayload(questionId);
      const examples = TestPayload.getQuestionExamplesPayload(questionId);
      dbMock.question.findUnique = jest.fn().mockResolvedValue(question);
      dbMock.example.findMany = jest.fn().mockResolvedValue(examples);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/questions/${questionId}`
      );

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.OK);
      expect(body).toEqual({ ...question, examples, id: questionId });
    });
  });

  describe("Given a non-existing question id in the database", () => {
    it("should return 404 with an error message", async () => {
      const questionId = "nonexistingquestionid123";
      dbMock.question.findUnique = jest.fn().mockResolvedValue(null);

      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/questions/${questionId}`
      );

      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "Question not found.",
      });
    });
  });

  describe("Given an unexpected error has occurred", () => {
    it("should return 500 with an error message", async () => {
      const questionId = "existingquestionid123";
      dbMock.question.findUnique = jest
        .fn()
        .mockRejectedValue(new Error("Unexpected error"));

      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/questions/${questionId}`
      );

      expect(statusCode).toEqual(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "An unexpected error has occurred.",
      });
    });
  });
});

describe("GET /topics", () => {
  it("should return 200 with all topics", async () => {
    // Arrange
    const topics = Object.values(Topic);

    // Act
    const { body, statusCode } = await supertest(app).get(
      `/${API_PREFIX}/topics`
    );

    // Assert
    expect(statusCode).toEqual(HttpStatusCode.OK);
    expect(body).toEqual({ topics });
  });
});
