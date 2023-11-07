import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import * as TestPayload from "../utils/payloads";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../models/db";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const API_PREFIX = `question/api`;

describe("DELETE /${API_PREFIX}/questions/:questionId", () => {
  describe("Given an existing question id", () => {
    it("should return 204 with no content", async () => {
      const questionId = "existingquestionid123";
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValue(TestPayload.getQuestionPayload(questionId));
      dbMock.question.delete = jest.fn().mockResolvedValue(null);

      const { statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/questions/${questionId}`
      );

      expect(statusCode).toEqual(HttpStatusCode.NO_CONTENT);
    });
  });

  describe("Given a non-existing question id", () => {
    it("should return 404 with a not found message", async () => {
      const questionId = "nonexistingquestionid123";
      dbMock.question.findFirst = jest.fn().mockResolvedValue(null);

      const { body, statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/questions/${questionId}`
      );

      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: `Question with id ${questionId} not found.`,
      });
    });
  });

  describe("Given an unexpected error", () => {
    it("should return 500 with an unexpected error message", async () => {
      const questionId = "existingquestionid123";
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValue(TestPayload.getQuestionPayload(questionId));
      dbMock.question.delete = jest
        .fn()
        .mockRejectedValue(new Error("Unexpected error"));

      const { body, statusCode } = await supertest(app).delete(
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
