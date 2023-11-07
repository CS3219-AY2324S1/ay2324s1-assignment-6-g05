import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import { HistoryPayload, generateCUID } from "../utils/payloads";
import db from "../../lib/db";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const NODE_ENV = process.env.NODE_ENV || "test";
const API_PREFIX = `history/api`;

describe("POST /api/history", () => {
  describe("Given a valid user id and question id", () => {
    it("should return 201", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });

      // ensure the user id exists
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      // ensure the question id exists
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });
      // ensure the history does not exist
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce(null);
      dbMock.history.create = jest.fn().mockResolvedValueOnce(null);
      // mock functions that will never be called
      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.create).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.question.findFirst).toBeCalledTimes(1);
      expect(dbMock.history.update).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(0);
    });
  });

  describe("Given 2 user ids that have no history record yet and a question id", () => {
    it("should return 201", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID()];
      const questionId = generateCUID();

      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: userIds[0],
        })
        .mockResolvedValueOnce({
          id: userIds[1],
        });
      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce({
        id: questionId,
      });
      dbMock.history.findFirst = jest.fn().mockResolvedValue(null);
      dbMock.history.create = jest.fn().mockResolvedValue(null);
      // mock functions that will never be called
      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(
          HistoryPayload.getCreateHistoryBodyPayload({
            userId: userIds,
            questionId: questionId,
          })
        );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.create).toBeCalledTimes(2);
      expect(dbMock.history.update).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(0);
    });
  });

  describe("Given a valid user id, question id, language, and code", () => {
    it("should return 201", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
        language: "C++",
        hasCode: true,
      });

      // ensure the user id exists
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      // ensure the question id exists
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });
      // ensure the history does not exist
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce(null);
      dbMock.history.create = jest.fn().mockResolvedValueOnce({
        id: generateCUID(),
      });
      dbMock.codeSubmission.create = jest.fn().mockResolvedValueOnce(null);
      // mock functions that will never be called
      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.create).toBeCalledTimes(1);
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.question.findFirst).toBeCalledTimes(1);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(1);
      expect(dbMock.history.update).toBeCalledTimes(0);
    });
  });

  describe("Given a valid user id, question id, language, and code such that the history exists but not the language", () => {
    it("should return 201", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
        language: "JAVA",
        hasCode: true,
      });

      // ensure the user id exists
      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      // ensure the question id exists
      dbMock.question.findFirst = jest.fn().mockResolvedValue({
        id: questionId,
      });
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce({
        id: generateCUID(),
        languages: ["C++"],
      });

      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValueOnce(null);
      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.update).toBeCalledTimes(1);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(1);
      expect(dbMock.history.create).toBeCalledTimes(0);
    });
  });

  describe("Given 2 user ids, with code, with 1 that already has a history record", () => {
    it("should return 201", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID()];
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userIds,
        questionId: questionId,
        language: "PYTHON",
        hasCode: true,
      });

      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: userIds[0],
        })
        .mockResolvedValueOnce({
          id: userIds[1],
        });

      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce({
        id: questionId,
      });

      dbMock.history.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: generateCUID(),
          languages: ["C++"],
        })
        .mockResolvedValueOnce(null);

      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValue(null);
      dbMock.history.create = jest.fn().mockResolvedValue({
        id: generateCUID(),
      });

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.update).toBeCalledTimes(1);
      expect(dbMock.history.create).toBeCalledTimes(1);
      expect(dbMock.history.create).toBeCalledWith({
        data: {
          userId: userIds[1],
          questionId: questionId,
          languages: ["PYTHON"],
        },
      });
      expect(dbMock.codeSubmission.create).toBeCalledTimes(2);
    });
  });

  describe("Given 2 user ids who already have history records, but they now have a new language", () => {
    it("should return 201", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID()];
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userIds,
        questionId: questionId,
        language: "JAVASCRIPT",
        hasCode: true,
      });

      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: userIds[0],
        })
        .mockResolvedValueOnce({
          id: userIds[1],
        });
      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce({
        id: questionId,
      });
      dbMock.history.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: generateCUID(),
          languages: ["C++"],
        })
        .mockResolvedValueOnce({
          id: generateCUID(),
          languages: ["JAVA"],
        });

      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValue(null);
      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CREATED);
      expect(body).toEqual({ message: "History created successfully" });
      expect(dbMock.history.update).toBeCalledTimes(2);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(2);
      expect(dbMock.history.create).toBeCalledTimes(0);
    });
  });

  describe("Given a non-cuid user id", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = "123";
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid user id",
      });
    });
  });

  describe("Given more than 2 user ids", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID(), generateCUID()];
      const questionId = generateCUID();

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(
          HistoryPayload.getCreateHistoryBodyPayload({
            userId: userIds,
            questionId: questionId,
          })
        );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid userId. Array must contain exactly 2 element(s)",
      });
    });
  });

  describe("Given 2 duplicated user ids", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(
          HistoryPayload.getCreateHistoryBodyPayload({
            userId: [userId, userId],
            questionId: questionId,
          })
        );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Duplicate user ids",
      });
    });
  });

  describe("Given a non-cuid question id", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = "123";
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid question id",
      });
    });
  });

  describe("Given a language with an invalid language", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryRequestBody =
        HistoryPayload.getCreateHistoryBodyPayload({
          userId: userId,
          questionId: questionId,
        });
      createHistoryRequestBody.language = "INVALID";

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryRequestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid language",
      });
    });
  });

  describe("Given an empty code", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryRequestBody =
        HistoryPayload.getCreateHistoryBodyPayload({
          userId: userId,
          questionId: questionId,
          hasCode: true,
        });
      createHistoryRequestBody.code = "";

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryRequestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid code. String must contain at least 10 character(s)",
      });
    });
  });

  describe("Given a code with more than 10000 characters", () => {
    it("should return 400 with an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryRequestBody =
        HistoryPayload.getCreateHistoryBodyPayload({
          userId: userId,
          questionId: questionId,
          hasCode: true,
        });
      createHistoryRequestBody.code = "a".repeat(10001);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryRequestBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid code. String must contain at most 10000 character(s)",
      });
    });
  });

  describe("Given no request body", () => {
    it("should return 400 and an error message", async () => {
      // Act
      const { body, statusCode } = await supertest(app).post(
        `/${API_PREFIX}/history`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is required",
      });
    });
  });

  describe("Given a request body with extra properties", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send({ ...createHistoryBody, extra: "extra" });

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid properties in request body",
      });
    });
  });

  describe("Given a user id that does not exist", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });
      dbMock.user.findFirst = jest.fn().mockResolvedValue(null);
      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "User id cannot be found",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.history.create).toBeCalledTimes(0);
    });
  });

  describe("Given 2 user id with 1 that does not exist", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID()];
      const questionId = generateCUID();
      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: userIds[0],
        })
        .mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(
          HistoryPayload.getCreateHistoryBodyPayload({
            userId: userIds,
            questionId: questionId,
          })
        );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "User id cannot be found",
      });
    });
  });

  describe("Given a question id that does not exist", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });
      dbMock.user.findFirst = jest.fn().mockResolvedValueOnce({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce(null);
      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "Question id cannot be found",
      });
      expect(dbMock.user.findFirst).toBeCalledTimes(1);
      expect(dbMock.question.findFirst).toBeCalledTimes(1);
      expect(dbMock.history.create).toBeCalledTimes(0);
    });
  });

  describe("Given a user id, question id, and language that already exists in the database", () => {
    it("should return 409 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
        language: "C++",
      });

      dbMock.user.findFirst = jest.fn().mockResolvedValue({
        id: userId,
      });
      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce({
        id: questionId,
      });
      dbMock.history.findFirst = jest.fn().mockResolvedValueOnce({
        userId: userId,
        questionId: questionId,
        languages: ["C++"],
      });
      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValueOnce(null);
      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CONFLICT);
      expect(body).toEqual({
        error: "CONFLICT",
        message: "History already exists",
      });
      expect(dbMock.history.create).toBeCalledTimes(0);
      expect(dbMock.history.update).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(0);
    });
  });

  describe("Given 2 user ids, with 1 of them having a history record with the same language", () => {
    it("should return 409 and an error message", async () => {
      // Arrange
      const userIds = [generateCUID(), generateCUID()];
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userIds,
        questionId: questionId,
        language: "C++",
      });

      dbMock.user.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: userIds[0],
        })
        .mockResolvedValueOnce({
          id: userIds[1],
        });

      dbMock.question.findFirst = jest.fn().mockResolvedValueOnce({
        id: questionId,
      });

      dbMock.history.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          id: generateCUID(),
          languages: ["C++"],
        })
        .mockResolvedValueOnce(null);

      // mock functions that will never be called
      dbMock.history.create = jest.fn().mockResolvedValue(null);
      dbMock.history.update = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.create = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.CONFLICT);
      expect(body).toEqual({
        error: "CONFLICT",
        message: "History already exists",
      });
      expect(dbMock.history.create).toBeCalledTimes(0);
      expect(dbMock.history.update).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.create).toBeCalledTimes(0);
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const createHistoryBody = HistoryPayload.getCreateHistoryBodyPayload({
        userId: userId,
        questionId: questionId,
      });

      dbMock.user.findFirst = jest.fn().mockRejectedValueOnce({ id: userId });
      dbMock.question.findFirst = jest
        .fn()
        .mockRejectedValueOnce({ question: questionId });
      dbMock.history.findFirst = jest.fn().mockRejectedValueOnce(null);
      dbMock.history.createMany = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database is down"));

      // Act
      const { body, statusCode } = await supertest(app)
        .post(`/${API_PREFIX}/history`)
        .send(createHistoryBody);

      // Assert
      expect(statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "An unexpected error has occurred",
      });
    });
  });
});
