import supertest from "supertest";
import { generateCUID } from "../utils/payloads";
import db from "../../lib/db";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import createUnitTestServer from "../utils/server";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const NODE_ENV = process.env.NODE_ENV || "test";
const API_PREFIX = `history/api`;

describe("DELETE /api/history/user/:userId/question/:questionId", () => {
  describe("Given a valid user id and question id", () => {
    it("should return 204", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce({
        id: generateCUID(),
      });
      dbMock.history.delete = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NO_CONTENT);
    });
  });

  describe("Given a non-existing pair of user id and question id", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "The history record does not exist",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.history.findFirst = jest.fn().mockRejectedValueOnce({
        id: generateCUID(),
      });
      dbMock.history.delete = jest
        .fn()
        .mockResolvedValueOnce(new Error("Database is down"));

      // Act
      const { body, statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "An unexpected error has occurred",
      });
    });
  });
});
