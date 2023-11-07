import supertest from "supertest";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../lib/db";
import createUnitTestServer from "../utils/server";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;

const API_PREFIX = `user/api`;

describe("DELETE /api/users/:userId", () => {
  describe("Given an existing user id", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const userId = "existinguserid123";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.user.delete = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/users/${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledWith({
        where: {
          id: userId,
        },
      });
      expect(dbMock.user.delete).toBeCalledWith({
        where: {
          id: userId,
        },
      });
    });
  });

  describe("Given a non-existing user id", () => {
    it("should return 404 with an error message in json", async () => {
      // Arrange
      const userId = "nonexistinguserid123";
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app).delete(
        `/${API_PREFIX}/users/${userId}`
      );

      // Assert
      expect(dbMock.user.findFirst).toBeCalledWith({
        where: {
          id: userId,
        },
      });
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body.error).toBe("NOT FOUND");
      expect(body.message).toBe(`User with id ${userId} cannot be found.`);
    });
  });
});
