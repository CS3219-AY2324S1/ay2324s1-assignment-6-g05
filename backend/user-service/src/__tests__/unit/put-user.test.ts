import * as testPayloads from "../utils/payloads";
import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import db from "../../lib/db";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const dbMock = db as jest.Mocked<typeof db>;
const app = createUnitTestServer();

const API_PREFIX = `user/api`;

describe("PUT /api/users/:userId", () => {
  describe("Given an existing user id with valid request body payload", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const userId = "existinguserid123";
      const requestBody = testPayloads.getUpdateUserPayload();
      const user = testPayloads.getUserPayload({ userId });
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(null);
      dbMock.user.update = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledWith({
        where: {
          id: userId,
        },
      });
      expect(dbMock.user.update).toBeCalledWith({
        where: {
          id: userId,
        },
        data: requestBody,
      });
    });
  });

  describe("Given an existing user id with valid request body without providing email", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const userId = "existinguserid123";
      const user = testPayloads.getUserPayload({ userId });
      db.user.findFirst = jest.fn().mockResolvedValueOnce(user);
      db.user.update = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send({ name: "New Name" });

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NO_CONTENT);
      expect(db.user.findFirst).toBeCalledWith({
        where: {
          id: userId,
        },
      });
      expect(db.user.update).toBeCalledWith({
        where: {
          id: userId,
        },
        data: { name: "New Name" },
      });
    });
  });

  describe("Given a non-existing user id", () => {
    it("should return 404 with an error message in json", async () => {
      // Arrange
      const userId = "nonexistinguserid123";
      const requestBody = testPayloads.getUpdateUserPayload();
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send(requestBody);

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

  describe("Given an existing user id with empty request body", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const userId = "existinguserid123";
      const requestBody = {};

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Request body is missing.");
    });
  });

  describe("Given an existing user id with invalid request body", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const userId = "existinguserid123";
      let requestBody = testPayloads.getUpdateUserPayload();
      requestBody.email = "invalidemail";

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).not.toBeNull();
    });
  });

  describe("Given an existing user id with duplicated email", () => {
    it("should return 409 with an error message in json", async () => {
      // Arrange
      const userId = "existinguserid123";
      const email = "duplicated@email.com";
      let requestBody = testPayloads.getUpdateUserPayload();
      requestBody.email = email;
      const user = testPayloads.getUserPayload({ userId: userId });
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(email);

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CONFLICT);
      expect(body.error).toBe("CONFLICT");
      expect(body.message).toBe(`User with email ${email} already exists.`);
    });
  });
});

describe("PUT /api/users/:userId/preferences", () => {
  describe("Given an existing user id with valid request body payload", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const userId = "existinguserid123";
      const requestBody = testPayloads.getUpdatePreferencesPayload();
      const user = testPayloads.getUserPayload({ userId });
      const preferences = testPayloads.getUserPreferencesPayload({ userId });
      dbMock.user.findFirst = jest.fn().mockResolvedValueOnce(user);
      dbMock.preferences.findFirst = jest
        .fn()
        .mockResolvedValueOnce(preferences);
      dbMock.preferences.update = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}/preferences`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledWith({
        where: {
          id: userId,
        },
      });
      expect(dbMock.preferences.findFirst).toBeCalledWith({
        where: {
          userId,
        },
      });
      expect(dbMock.preferences.update).toBeCalled();
    });
  });

  describe("Given duplicated language in request body", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const userId = "existinguserid123";
      const requestBody = testPayloads.getUpdatePreferencesPayload();
      // now we have double Python in the requestBody
      requestBody.languages.push("Python");
      const user = testPayloads.getUserPayload({ userId });
      dbMock.user.findFirst = jest.fn().mockResolvedValueOnce(user);

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}/preferences`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Language provided must be unique");
    });
  });

  describe("Given invalid topic in request body", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const userId = "existinguserid123";
      const requestBody = testPayloads.getUpdatePreferencesPayload();
      // now we have invalid topic in the requestBody
      requestBody.topics.push("Invalid Topic");
      const user = testPayloads.getUserPayload({ userId });
      dbMock.user.findFirst = jest.fn().mockResolvedValueOnce(user);

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/users/${userId}/preferences`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Invalid topic");
    });
  });
});
