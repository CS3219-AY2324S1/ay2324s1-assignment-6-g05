import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import db from "../../lib/db";
import { HistoryPayload, generateCUID } from "../utils/payloads";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const NODE_ENV = process.env.NODE_ENV || "test";
const API_PREFIX = `history/api`;

describe("PUT /history/user/:userId/question/:questionId/code", () => {
  describe("Given a valid user id, question id, with a valid language and code in request body", () => {
    it("should return 204", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "C++",
        });
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });
      dbMock.history.findFirst = jest.fn().mockResolvedValue({
        id: generateCUID(),
        languages: ["C++"],
      });
      dbMock.codeSubmission.update = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NO_CONTENT);
      expect(dbMock.codeSubmission.update).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.question.findFirst).toBeCalledTimes(1);
      expect(dbMock.history.findFirst).toBeCalledTimes(1);
    });
  });

  describe("Given a non-existent user id", () => {
    it("should return 404 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "C++",
        });
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "User does not exist",
      });
    });
  });

  describe("Given a non-existent question id", () => {
    it("should return 404 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "C++",
        });
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "Question does not exist",
      });
    });
  });

  describe("Given empty request body", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });

      // Act
      const { statusCode, body } = await supertest(app).put(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
      );

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is required",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(0);
      expect(dbMock.question.findFirst).toBeCalledTimes(0);
    });
  });

  describe("Given the request body contains extra fields", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "PYTHON",
        });

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send({ ...updateCodeHistoryBody, extra: "extra" });

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid properties in request body",
      });
    });
  });

  describe("Given an empty code", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "C++",
        });
      updateCodeHistoryBody.code = "";

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid code. String must contain at least 10 character(s)",
      });
    });
  });

  describe("Given the code is larger than the threshold", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "C++",
          code: "a".repeat(10001),
        });

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid code. String must contain at most 10000 character(s)",
      });
    });
  });

  describe("Given a non-existent history", () => {
    it("should return 404 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "JAVASCRIPT",
        });
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });
      dbMock.history.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "History does not exist",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const updateCodeHistoryBody =
        HistoryPayload.getUpdateCodeHistoryBodyPayload({
          language: "JAVA",
        });
      dbMock.user.findFirst = jest.fn().mockRejectedValue(null);

      // Act
      const { statusCode, body } = await supertest(app)
        .put(
          `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
        )
        .send(updateCodeHistoryBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "An unexpected error has occurred",
      });
    });
  });
});
