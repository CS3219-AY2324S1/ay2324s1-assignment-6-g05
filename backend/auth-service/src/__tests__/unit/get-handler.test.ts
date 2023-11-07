import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import db from "../../lib/db";
import createUnitTestServer from "../utils/server";
import jwt from "jsonwebtoken";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

// env variables mocking
process.env.EMAIL_RESET_SECRET = "testEmailResetSecret";

describe("GET /auth/api/verifyResetPasswordLinkValidity/:id/:token", () => {
  describe("Given a valid token and user id", () => {
    it("should return 200 OK", async () => {
      // Assign
      jwtMock.verify = jest
        .fn()
        .mockReturnValue({ email: "testuser@email.com" });
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        email: "testuser@email.com",
        passwordResetToken: "testPasswordResetToken",
      });

      // Act
      const response = await supertest(app).get(
        "/auth/api//verifyResetPasswordLinkValidity/testUserId/testPasswordResetToken"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.OK);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe("Given an invalid token", () => {
    it("should return 403 Forbidden", async () => {
      // Assign
      jwtMock.verify = jest.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });
      // mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();

      // Act
      const response = await supertest(app).get(
        "/auth/api//verifyResetPasswordLinkValidity/testUserId/invalidToken"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
      expect(dbMock.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("Given the user id does not exist in the database", () => {
    it("should return 403 Forbidden", async () => {
      // Assign
      jwtMock.verify = jest
        .fn()
        .mockReturnValue({ email: "testuser@email.com" });
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const response = await supertest(app).get(
        "/auth/api//verifyResetPasswordLinkValidity/testUserId/testPasswordResetToken"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 403 Forbidden", async () => {
      // Assign
      jwtMock.verify = jest
        .fn()
        .mockReturnValue({ email: "testuser@email.com" });
      dbMock.user.findFirst = jest.fn().mockImplementation(() => {
        throw new Error("Database is down");
      });

      // Act
      const response = await supertest(app).get(
        "/auth/api//verifyResetPasswordLinkValidity/testUserId/testPasswordResetToken"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });
});
