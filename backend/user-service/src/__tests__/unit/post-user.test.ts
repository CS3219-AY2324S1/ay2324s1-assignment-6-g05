import supertest from "supertest";
import db from "../../lib/db";
import * as testPayloads from "../utils/payloads";
import createUnitTestServer from "../utils/server";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;

const API_PREFIX = `user/api`;

describe("POST /api/users", () => {
  describe("Given the request body payload is valid", () => {
    it("should return 201 with a message of User Created and the registered userId", async () => {
      // Arrange
      const requestBody = testPayloads.getPostUserPayload();
      dbMock.user.findFirst = jest.fn().mockReturnValue(null);
      dbMock.user.create = jest
        .fn()
        .mockResolvedValue(
          testPayloads.getUserPayload({ userId: "userId123" })
        );
      dbMock.preferences.create = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/users`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body.id).toBe("userId123");
      expect(body.message).toBe("User created.");
    });
  });

  describe("Given the request body payload contains extra property", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const initialPayload = testPayloads.getPostUserPayload();
      const requestBody = {
        ...initialPayload,
        extraProperty: "extra property",
      };

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/users`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Invalid properties in request body.");
    });
  });

  describe("Given the request body payload contains invalid property", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      let requestBody = testPayloads.getPostUserPayload();
      requestBody.role = "Invalid User";

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/users`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
    });
  });

  describe("Given the request body payload is empty", () => {
    it("should return 400 with an error message in json", async () => {
      // Arrange
      const requestBody = {};

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/users`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body.error).toBe("BAD REQUEST");
      expect(body.message).toBe("Request body is missing.");
    });
  });

  describe("Given the email is duplicated", () => {
    it("should return 409 with an error message in json", async () => {
      // Arrange
      const email = "duplicated@email.com";
      let requestBody = testPayloads.getPostUserPayload();
      requestBody.email = email;
      dbMock.user.findFirst = jest.fn().mockReturnValue({
        email: email,
      });

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/users`)
        .send(requestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CONFLICT);
      expect(body.error).toBe("CONFLICT");
      expect(body.message).toBe(`User with email ${email} already exists.`);
    });
  });
});
