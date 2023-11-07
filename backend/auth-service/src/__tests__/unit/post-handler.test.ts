import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { VerificationMail } from "../../lib/email/verificationMail";
import { UserService } from "../../lib/user_api_helpers";
import createUnitTestServer from "../utils/server";
import db from "../../lib/db";
import { Payloads } from "../utils/payloads";
import jwt from "jsonwebtoken";

const app = createUnitTestServer();
const userServiceMock = UserService as jest.Mocked<typeof UserService>;
const dbMock = db as jest.Mocked<typeof db>;
const mailerMock = VerificationMail as jest.Mocked<typeof VerificationMail>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

// env variables mocking
process.env.EMAIL_VERIFICATION_SECRET = "testEmailVerificationSecret";

describe("POST /auth/api/registerByEmail", () => {
  describe("Given a valid user creation request body", () => {
    it("should return 201", async () => {
      // mock UserService.createUser
      userServiceMock.createUser = jest.fn().mockResolvedValue({
        status: HttpStatusCode.CREATED,
        json: jest.fn().mockResolvedValue({
          id: "testUserId",
          email: "testuser@email.com",
          verificationToken: "testToken",
        }),
      });

      // mock VerificationMail.send
      mailerMock.prototype.send = jest.fn().mockResolvedValue(true);

      // Act
      const { body, status } = await supertest(app)
        .post("/auth/api/registerByEmail")
        .send({
          name: "testUser",
          email: "Test Username",
          password: "testPassword",
          role: "USER",
        });

      // Assert
      expect(status).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({
        success: true,
        userId: "testUserId",
      });
      expect(userServiceMock.createUser).toBeCalledTimes(1);
      expect(mailerMock.prototype.send).toBeCalledTimes(1);
    });
  });

  describe("Given a user creation request body that is missing required fields", () => {
    it("should return 400 with an error message", async () => {
      // Assign
      const requestBody = {
        name: "testUser",
        email: "Test Username",
        password: "testPassword",
        // role is missing
      };
      // mocked functions that should not be called
      userServiceMock.createUser = jest.fn();
      mailerMock.prototype.send = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .post("/auth/api/registerByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Name, email, password, and role are required.",
      });
      expect(userServiceMock.createUser).not.toBeCalled();
      expect(mailerMock.prototype.send).not.toBeCalled();
    });
  });

  describe("Given an empty user creation request body", () => {
    it("should return 400 with an error message", async () => {
      // Assign
      const requestBody = undefined;
      // mocked functions that should not be called
      userServiceMock.createUser = jest.fn();
      mailerMock.prototype.send = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .post("/auth/api/registerByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
    });
  });

  describe("Given user service returns an 4xx error due to invalid request", () => {
    describe("Given user service returns 400", () => {
      it("should return 400", async () => {
        // Assign
        const requestBody = {
          name: "testUser",
          email: "Test Username",
          password: "pwd",
          role: "USER",
        };
        userServiceMock.createUser = jest.fn().mockResolvedValue({
          status: HttpStatusCode.BAD_REQUEST,
          json: jest.fn().mockResolvedValue({
            error: "BAD REQUEST",
            message:
              "Invalid password. String(s) must be at least 8 characters long",
          }),
        });
        // mocked functions that should not be called
        mailerMock.prototype.send = jest.fn();

        // Act
        const { body, status } = await supertest(app)
          .post("/auth/api/registerByEmail")
          .send(requestBody);

        // Assert
        expect(status).toBe(HttpStatusCode.BAD_REQUEST);
        expect(body).toEqual({
          error: "BAD REQUEST",
          message:
            "Invalid password. String(s) must be at least 8 characters long",
        });
        expect(userServiceMock.createUser).toBeCalledTimes(1);
        expect(mailerMock.prototype.send).not.toBeCalled();
      });
    });

    describe("Given user service returns 409", () => {
      it("should return 409 with the same error message as user service API response", async () => {
        // Assign
        const requestBody = {
          name: "testUser",
          email: "duplicateduser@email.com",
          password: "testPassword",
          role: "USER",
        };
        userServiceMock.createUser = jest.fn().mockResolvedValue({
          status: HttpStatusCode.CONFLICT,
          json: jest.fn().mockResolvedValue({
            error: "CONFLICT",
            message: "User with email duplicateduser@email.com already exists",
          }),
        });

        // mocked functions that should not be called
        mailerMock.prototype.send = jest.fn();

        // Act
        const { body, status } = await supertest(app)
          .post("/auth/api/registerByEmail")
          .send(requestBody);

        // Assert
        expect(status).toBe(HttpStatusCode.CONFLICT);
        expect(body).toEqual({
          error: "CONFLICT",
          message: "User with email duplicateduser@email.com already exists",
        });
        expect(userServiceMock.createUser).toBeCalledTimes(1);
        expect(mailerMock.prototype.send).not.toBeCalled();
      });
    });
  });

  describe("Given user service is down", () => {
    it("should return 500 with error message", async () => {
      // Assign
      const requestBody = {
        name: "testUser",
        email: "Test Username",
        password: "testPassword",
        role: "USER",
      };
      userServiceMock.createUser = jest
        .fn()
        .mockRejectedValue(new Error("User service is down"));
      // mocked functions that should not be called
      mailerMock.prototype.send = jest.fn();

      // Act
      const { body, status } = await supertest(app)
        .post("/auth/api/registerByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "User service is down.",
      });
      expect(userServiceMock.createUser).toBeCalledTimes(1);
      expect(mailerMock.prototype.send).not.toBeCalled();
    });
  });
});

describe("POST /auth/api/loginByEmail", () => {
  describe("Given a valid user login request body", () => {
    it("should return 200 with the user information without secrets", async () => {
      // Assign
      const userPassword = "testPassword";
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValue(
          Payloads.getDatabaseUserWithPassword({ password: userPassword })
        );

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send({
          email: "testuser@email.com",
          password: userPassword,
        });

      // Assert
      expect(status).toBe(HttpStatusCode.OK);

      const expectedReturnedUser = Payloads.getUserPayloadWithoutSecrets();
      expect(body).toEqual({
        success: true,
        user: expectedReturnedUser,
      });
      console.log(header["set-cookie"][0]);
      expect(header["set-cookie"][0]).toMatch(/jwt=eyJh.+/);
    });
  });

  describe("Given a user login request body that is missing required fields", () => {
    it("should return 400 with an error message", async () => {
      // Assign
      const requestBody = {
        // email is missing
        password: "testPassword",
      };
      // mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Email and password are required.",
      });
      expect(dbMock.user.findFirst).not.toBeCalled();
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
    });
  });

  describe("Given an empty user login request body", () => {
    it("should return 400 with an error message", async () => {
      // Assign
      const requestBody = undefined;
      // mocked functions that should not be called
      dbMock.user.findFirst = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
    });
  });

  describe("Given no user is found with the given email", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "nonexistinguser@email.com",
        password: "testPassword",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);
      // mocked functions that should not be called
      jwtMock.verify = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(body).toEqual({
        error: "UNAUTHORIZED",
        message: "The user credentials are incorrect.",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
      expect(jwtMock.verify).not.toBeCalled();
    });
  });

  describe("Given the user password is incorrect", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        password: "wrongpassword",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValue(
          Payloads.getDatabaseUserWithPassword({ password: "testPassword" })
        );
      // mocked functions that should not be called
      jwtMock.verify = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(body).toEqual({
        error: "UNAUTHORIZED",
        message: "The user credentials are incorrect.",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
      expect(jwtMock.verify).not.toBeCalled();
    });
  });

  describe("Given the user is not verified", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        password: "testPassword",
      };
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        ...Payloads.getDatabaseUserWithPassword({ password: "testPassword" }),
        isVerified: false,
      });
      // mocked functions that should not be called
      jwtMock.verify = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.FORBIDDEN);
      expect(body).toEqual({
        error: "FORBIDDEN",
        message: "User is not verified.",
      });

      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
      expect(jwtMock.verify).not.toBeCalled();
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "testuser@email.com",
        password: "testPassword",
      };
      dbMock.user.findFirst = jest
        .fn()
        .mockRejectedValue(new Error("Database is down"));

      // mocked functions that should not be called
      jwtMock.verify = jest.fn();

      // Act
      const { header, body, status } = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "Internal server error",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      // no cookie should be set
      expect(body).not.toHaveProperty("set-cookie");
      expect(header["set-cookie"]).toBeUndefined();
      expect(jwtMock.verify).not.toBeCalled();
    });
  });
});

describe("POST /auth/api/logout", () => {
  it("should return 200 and clear the cookie", async () => {
    // Assign
    const jwtCookie = "jwt=testJwtCookie";

    // Act
    const response = await supertest(app)
      .post("/auth/api/logout")
      .set("Cookie", jwtCookie)
      .send();

    // Assert
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toEqual({
      success: true,
    });
    // ensure cookie is cleared
    expect(response.header["set-cookie"][0]).toMatch(/jwt=;/);
  });
});
