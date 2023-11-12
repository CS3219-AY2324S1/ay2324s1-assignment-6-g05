import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { VerificationMail } from "../../lib/email/verificationMail";
import { UserService } from "../../lib/user_api_helpers";
import createUnitTestServer from "../utils/server";
import db from "../../lib/db";
import { Payloads } from "../utils/payloads";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ResetPasswordMail } from "../../lib/email/resetPasswordMail";

const app = createUnitTestServer();
const userServiceMock = UserService as jest.Mocked<typeof UserService>;
const dbMock = db as jest.Mocked<typeof db>;
const mailerMock = VerificationMail as jest.Mocked<typeof VerificationMail>;
const resetPasswordMailMock = ResetPasswordMail as jest.Mocked<
  typeof ResetPasswordMail
>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

// env variables mocking
process.env.EMAIL_RESET_SECRET = "testEmailResetSecret";
process.env.EMAIL_VERIFICATION_SECRET = "testEmailVerificationSecret";

describe("PUT /auth/api/verifyEmail/:email/:token", () => {
  describe("Given a verify email request body with a valid token", () => {
    it("should return 204 and update the emailVerified field", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        token: "testToken",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: "testUserId",
        })
        .mockResolvedValueOnce({
          email: requestBody.email,
          verificationToken: requestBody.token,
        });
      jwtMock.verify = jest.fn().mockReturnValue({
        email: requestBody.email,
      });
      userServiceMock.updateVerification = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });

      // Act
      const { status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.NO_CONTENT);
      expect(jwtMock.verify).toBeCalledTimes(1);
      expect(jwtMock.verify).toHaveBeenCalledWith(
        requestBody.token,
        process.env.EMAIL_VERIFICATION_SECRET
      );
      expect(userServiceMock.updateVerification).toBeCalledTimes(1);
      expect(userServiceMock.updateVerification).toHaveBeenCalledWith(
        "testUserId"
      );
    });
  });

  describe("Given the user email doesn't exist", () => {
    it("should return 404 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "nonexistinguser@email.com",
        token: "testToken",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${requestBody.email} cannot be found.`,
      });
    });
  });

  describe("Given the token is invalid", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        token: "invalidToken",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
      });
      jwtMock.verify = jest.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "This verification link is invalid.",
      });
    });
  });

  describe("Given the token is valid but the email is different", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        token: "testToken",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValue({
          id: "testUserId",
        })
        .mockResolvedValueOnce({
          email: "testuser@email.com",
          verificationToken: "testToken",
        });
      jwtMock.verify = jest.fn().mockReturnValue({
        email: "other@email.com",
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "This verification link is invalid.",
      });
    });
  });

  describe("Given the user service failed to update the verification", () => {
    it("should return user service error code with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        token: "testToken",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: "testUserId",
        })
        .mockResolvedValueOnce({
          email: requestBody.email,
          verificationToken: requestBody.token,
        });
      jwtMock.verify = jest.fn().mockReturnValue({
        email: requestBody.email,
      });
      userServiceMock.updateVerification = jest.fn().mockResolvedValue({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        json: jest.fn().mockResolvedValue({
          error: "INTERNAL SERVER ERROR",
          message: "User database is down.",
        }),
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "User database is down.",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        token: "testToken",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error("Database is down"));

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/verifyEmail/${requestBody.email}/${requestBody.token}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Email verification failed.",
      });
    });
  });
});

describe("PUT /auth/api/resendVerificationEmail/:email", () => {
  describe("Given a resend verification email request body with a valid email", () => {
    it("should return 204 and send a verification email", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
        isVerified: false,
      });
      jwtMock.sign = jest.fn().mockReturnValue("testToken");
      userServiceMock.updateVerificationToken = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });
      mailerMock.prototype.send = jest.fn().mockResolvedValue(null);

      // Act
      const { status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: requestBody.email,
        },
        select: {
          id: true,
          isVerified: true,
        },
      });
      expect(jwtMock.sign).toBeCalledTimes(1);
      expect(jwtMock.sign).toHaveBeenCalledWith(
        {
          email: requestBody.email,
        },
        process.env.EMAIL_VERIFICATION_SECRET
      );
      expect(userServiceMock.updateVerificationToken).toBeCalledTimes(1);
      expect(userServiceMock.updateVerificationToken).toHaveBeenCalledWith(
        "testUserId",
        "testToken"
      );
      expect(mailerMock.prototype.send).toBeCalledTimes(1);
    });
  });

  describe("Given the user email doesn't exist", () => {
    it("should return 404 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "nonexistinguser@email.com",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${requestBody.email} cannot be found.`,
      });
    });
  });

  describe("Given the user is already verified", () => {
    it("should return 409 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "verified@email.com",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
        isVerified: true,
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.CONFLICT);
      expect(body).toEqual({
        error: "CONFLICT",
        message: `User with email ${requestBody.email} is already verified.`,
      });
    });
  });

  describe("Given user service failed to update the verification token", () => {
    it("should return user service error code with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
        isVerified: false,
      });
      jwtMock.sign = jest.fn().mockReturnValue("testToken");
      userServiceMock.updateVerificationToken = jest.fn().mockResolvedValue({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        json: jest.fn().mockResolvedValue({
          error: "INTERNAL SERVER ERROR",
          message: "User service is down.",
        }),
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "User service is down.",
      });
    });
  });

  describe("Given the verification token failed to generate", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
        isVerified: false,
      });
      jwtMock.sign = jest.fn().mockImplementation(() => {
        throw new Error("Failed to generate verification token");
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Resend verification email failed.",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error("Database is down"));

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/resendVerificationEmail/${requestBody.email}`)
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Resend verification email failed.",
      });
    });
  });
});

describe("PUT /auth/api/sendPasswordResetEmail/:email", () => {
  describe("Given a send password reset email request body with a valid email", () => {
    it("should return 204 and send a password reset email", async () => {
      // Assign
      const email = "testuser@email.com";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
      });
      jwtMock.sign = jest.fn().mockReturnValue("testToken");
      userServiceMock.updatePasswordResetToken = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });
      resetPasswordMailMock.prototype.send = jest.fn().mockResolvedValue(null);

      // Act
      const { status } = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(status).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
      });
      expect(jwtMock.sign).toBeCalledTimes(1);
      expect(jwtMock.sign).toHaveBeenCalledWith(
        {
          email: email,
        },
        process.env.EMAIL_RESET_SECRET
      );
      expect(userServiceMock.updatePasswordResetToken).toBeCalledTimes(1);
      expect(userServiceMock.updatePasswordResetToken).toHaveBeenCalledWith(
        "testUserId",
        "testToken"
      );
      expect(resetPasswordMailMock.prototype.send).toBeCalledTimes(1);
    });
  });

  describe("Given the user email doesn't exist", () => {
    it("should return 404 with an error message", async () => {
      // Assign
      const email = "nonexistinguser@email.com";
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, status } = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(status).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${email} cannot be found.`,
      });
    });
  });

  describe("Given user service failed to update the password reset token", () => {
    it("should return user service error code with an error message", async () => {
      // Assign
      const email = "testuser@email.com";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
      });
      jwtMock.sign = jest.fn().mockReturnValue("testToken");
      userServiceMock.updatePasswordResetToken = jest.fn().mockResolvedValue({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        json: jest.fn().mockResolvedValue({
          error: "INTERNAL SERVER ERROR",
          message: "User service is down.",
        }),
      });

      // Act
      const { body, status } = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "User service is down.",
      });
    });
  });

  describe("Given the mailer fails to send email", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const email = "testuser@email.com";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: "testUserId",
      });
      jwtMock.sign = jest.fn().mockReturnValue("testToken");
      userServiceMock.updatePasswordResetToken = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });
      resetPasswordMailMock.prototype.send = jest.fn().mockRejectedValue(null);

      // Act
      const { body, status } = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Send reset password failed.",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const email = "testuser@email.com";
      dbMock.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error("Database is down"));

      // Act
      const { body, status } = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Send reset password failed.",
      });
    });
  });
});

describe("PUT /auth/api/changePassword/:id", () => {
  describe("Given a change password request body with a valid token", () => {
    it("should return 204 and update the password", async () => {
      // Assign
      const token = "testPasswordResetToken";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        email: "testuser@email.com",
        passwordResetToken: "testPasswordResetToken",
      });
      jwtMock.verify = jest.fn().mockReturnValue({
        email: "testuser@email.com",
      });
      userServiceMock.updatePassword = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });

      // Act
      const { status } = await supertest(app)
        .put("/auth/api/changePassword/testUserId")
        .send({
          token: token,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: "testUserId",
        },
        select: {
          email: true,
          passwordResetToken: true,
        },
      });
      expect(jwtMock.verify).toBeCalledTimes(1);
      expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
        "testUserId",
        {
          password: hashedNewPassword,
          passwordResetToken: "",
        }
      );
    });
  });

  describe("Given a change password request body with a not-self token", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const token = "invalidToken";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        email: "testuser@email.com",
      });
      jwtMock.verify = jest.fn().mockResolvedValue({
        email: "someoneelse@email.com",
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          token: token,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });

  describe("Given a change password request body with an invalid token", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const token = "invalidToken";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        email: "testuser@email.com",
      });
      jwtMock.verify = jest.fn().mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          token: token,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
    });
  });

  describe("Given a change password request body with an invalid user id", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const token = "testToken";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);
      jwtMock.verify = jest.fn().mockReturnValue({
        email: "testuser@email.com",
      });

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          token: token,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });

  describe("Given a change password request body with a request body with extra properties", () => {
    it("should return 400 with an error message", async () => {
      // Mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();
      jwtMock.verify = jest.fn();
      userServiceMock.updatePassword = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          token: "testToken",
          hashedNewPassword: "testHashedNewPassword",
          extraProperty: "testExtraProperty",
        });

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid property.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
      expect(jwtMock.verify).not.toBeCalled();
      expect(userServiceMock.updatePassword).not.toBeCalled();
    });
  });

  describe("Given a change password request with empty body", () => {
    it("should return 400 with an error message", async () => {
      // Mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();
      jwtMock.verify = jest.fn();
      userServiceMock.updatePassword = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({});

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
      expect(jwtMock.verify).not.toBeCalled();
      expect(userServiceMock.updatePassword).not.toBeCalled();
    });
  });

  describe("Given a change password request with missing hashedNewPassword", () => {
    it("should return 400 with an error message", async () => {
      // Mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();
      jwtMock.verify = jest.fn();
      userServiceMock.updatePassword = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          token: "testToken",
        });

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Token/old password + New hashed password is required.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
      expect(jwtMock.verify).not.toBeCalled();
      expect(userServiceMock.updatePassword).not.toBeCalled();
    });
  });

  describe("Given a change password request with missing token and oldPassword", () => {
    it("should return 400 with an error message", async () => {
      // Mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();
      jwtMock.verify = jest.fn();
      userServiceMock.updatePassword = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .put(`/auth/api/changePassword/testUserId`)
        .send({
          hashedNewPassword: "testHashedNewPassword",
        });

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Token/old password + New hashed password is required.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
      expect(jwtMock.verify).not.toBeCalled();
      expect(userServiceMock.updatePassword).not.toBeCalled();
    });
  });

  describe("Given a change password request with valid oldPassword", () => {
    it("should return 204 and update the password", async () => {
      // Assign
      const oldPassword = "testOldPassword";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        password: "testOldPassword",
      });
      bcryptMock.compare = jest.fn().mockResolvedValue(true);
      userServiceMock.updatePassword = jest.fn().mockResolvedValue({
        status: HttpStatusCode.NO_CONTENT,
      });

      // Act
      const { status } = await supertest(app)
        .put("/auth/api/changePassword/testUserId")
        .send({
          oldPassword: oldPassword,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.NO_CONTENT);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: "testUserId",
        },
        select: {
          password: true,
        },
      });
      expect(bcryptMock.compare).toBeCalledTimes(1);
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        oldPassword,
        "testOldPassword"
      );
      expect(userServiceMock.updatePassword).toBeCalledTimes(1);
      expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
        "testUserId",
        {
          password: hashedNewPassword,
        }
      );
    });
  });

  describe("Given a change password request with invalid oldPassword", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const oldPassword = "testOldPassword";
      const hashedNewPassword = "testHashedNewPassword";
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        password: "testOldPassword",
      });
      bcryptMock.compare = jest.fn().mockResolvedValue(false);

      // Act
      const { body, status } = await supertest(app)
        .put("/auth/api/changePassword/testUserId")
        .send({
          oldPassword: oldPassword,
          hashedNewPassword: hashedNewPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "You don't have the permission to change password.",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: "testUserId",
        },
        select: {
          password: true,
        },
      });
      expect(bcryptMock.compare).toBeCalledTimes(1);
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        oldPassword,
        "testOldPassword"
      );
    });
  });
});
