import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../lib/db";
import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import * as testPayloads from "../utils/payloads";

const dbMock = db as jest.Mocked<typeof db>;
const app = createUnitTestServer();

const API_PREFIX = `user/api`;

describe("GET /api/users/:userId", () => {
  describe("Given the user id exists in the database", () => {
    it("should return 200 with the user data in json", async () => {
      // Arrange
      const userId = "abcdefghijk1234567890";
      const payload = testPayloads.getUserPayload({ userId });
      dbMock.user.findFirst = jest.fn().mockResolvedValue(payload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      isSamePayload(payload, body);
    });
  });

  describe("Given the user id is invalid", () => {
    it("should return 404 with an error message in json", async () => {
      // Arrange
      const userId = "nonexistinguserid123";
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body.error).toBe("NOT FOUND");
      expect(body.message).toBe(`User with id ${userId} cannot be found.`);
    });
  });
});

describe("GET /api/users/email", () => {
  describe("Given the user email exists in the database", () => {
    it("should return 200 with the user data in json", async () => {
      // Arrange
      const email = "username@email.com";
      const payload = testPayloads.getUserPayload({ email });
      dbMock.user.findFirst = jest.fn().mockResolvedValue(payload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/email?email=${email}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      isSamePayload(payload, body);
    });
  });

  describe("Given the user email query parameter is empty in the API call", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const email = "";

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/email?email=${email}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Email is missing in the query parameter.");
    });
  });

  describe("Given the query parameter is missing", () => {
    it("should return 400 with an error message in json", async () => {
      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/email`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Email is missing in the query parameter.");
    });
  });

  describe("Given the user email query parameter is invalid", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const email = "invalidemail";

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/email?email=${email}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Invalid input email.");
    });
  });

  describe("Given an unexpected error occurs", () => {
    it("should return 500 with an error message in json", async () => {
      // Arrange
      const email = "username@email.com";
      dbMock.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error("Database throws an error"));

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/users/email?email=${email}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body.error).toBe("INTERNAL SERVER ERROR");
      expect(body.message).toBe("An unexpected error has occurred.");
    });
  });
});

type Payload = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  bio: string | null;
  gender: string | null;
  createdOn: Date;
  updatedOn: Date;
};

function isSamePayload(expectedPayload: Payload, actualPayload: Payload) {
  expect(actualPayload.id).toBe(expectedPayload.id);
  expect(actualPayload.name).toBe(expectedPayload.name);
  expect(actualPayload.email).toBe(expectedPayload.email);
  expect(actualPayload.role).toBe(expectedPayload.role);
  expect(actualPayload.image).toBe(expectedPayload.image);
  expect(actualPayload.bio).toBe(expectedPayload.bio);
  expect(actualPayload.gender).toBe(expectedPayload.gender);
}
