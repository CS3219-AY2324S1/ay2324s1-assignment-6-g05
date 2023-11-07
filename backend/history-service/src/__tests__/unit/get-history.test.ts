import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import db from "../../lib/db";
import { HistoryPayload, generateCUID } from "../utils/payloads";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

// set up for unit test
const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;
const NODE_ENV = process.env.NODE_ENV || "test";
const API_PREFIX = `history/api`;

describe("GET /api/history", () => {
  describe("Given a valid user id", () => {
    it("should return 200 with a list of history", async () => {
      // Arrange
      const userId = generateCUID();
      const historyPayload = HistoryPayload.getHistoryPayload({
        userId: userId,
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
    });
  });

  describe("Given a valid question id", () => {
    it("should return 200 with a list of history", async () => {
      // Arrange
      const questionId = generateCUID();
      const historyPayload = HistoryPayload.getHistoryPayload({
        questionId: questionId,
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?questionId=${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
    });
  });

  describe("Given a valid pair of user id and question id", () => {
    it("should return 200 with a list of history of length 1", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const historyPayload = HistoryPayload.getHistoryPayload({
        userId: userId,
        questionId: questionId,
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}&questionId=${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
      expect(body.data.length).toBe(1);
    });
  });

  describe("Given an array of user ids", () => {
    it("should return 200 with a list of history", async () => {
      // Arrange
      const userIdList = [generateCUID(), generateCUID(), generateCUID()];
      const historyPayload: {}[] = [];
      userIdList.forEach((userId) => {
        historyPayload.push(...HistoryPayload.getHistoryPayload({ userId }));
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userIdList[0]}&userId=${userIdList[1]}&userId=${userIdList[2]}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
    });
  });

  describe("Given an array of question ids", () => {
    it("should return 200 with a list of history", async () => {
      // Arrange
      const questionIdList = [generateCUID(), generateCUID(), generateCUID()];
      const historyPayload: {}[] = [];
      questionIdList.forEach((questionId) => {
        historyPayload.push(
          ...HistoryPayload.getHistoryPayload({ questionId })
        );
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?questionId=${questionIdList[0]}&questionId=${questionIdList[1]}&questionId=${questionIdList[2]}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
    });
  });

  describe("Given a valid user id with extra query parameters", () => {
    it("should return 200 with a list of history", async () => {
      // Arrange
      const userId = generateCUID();
      const historyPayload = HistoryPayload.getHistoryPayload({
        userId: userId,
      });
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce(historyPayload);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}&extraParam=${generateCUID()}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: historyPayload.length,
        data: historyPayload,
      });
    });
  });

  describe("Given a non-cuid user id", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = "123";

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid user id",
      });
    });
  });

  describe("Given 2 duplicated user ids", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}&userId=${userId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Duplicate user ids",
      });
    });
  });

  describe("Given question ids more than 10", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const questionIdList = [];
      for (let i = 0; i < 11; i++) {
        questionIdList.push(generateCUID());
      }

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?questionId=${questionIdList.join(
          "&questionId="
        )}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid questionId. Array must contain at most 10 element(s)",
      });
    });
  });

  describe("Given no request query parameters", () => {
    it("should return 400 and an error message", async () => {
      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "At least one of userId and questionId is required",
      });
    });
  });

  describe("Given no history record found from a valid pair of user id and question id", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.history.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}&questionId=${questionId}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "No history found",
      });
    });
  });

  describe("Given the database is down", () => {
    it("should return 500 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      dbMock.history.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database is down"));

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history?userId=${userId}`
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

describe("GET /api/history/user/:userId/question/:questionId/code", () => {
  describe("Given a valid user id, a question id, and a language in query param", () => {
    it("should return 200 with a code", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const language = encodeURIComponent("c++"); //take note that when using C++, encode it to c%2B%2B
      const code = "cout << 'Hello World!' << endl;";

      dbMock.codeSubmission.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ code: code });
      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${language}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        code: code,
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(1);
    });
  });

  describe("Given a valid user id, a question id, and multiple languages in query params", () => {
    it("should return 200 with respective code", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const languageList = [
        encodeURIComponent("c++"),
        encodeURIComponent("python"),
      ];

      const cppCode = "cout << 'Hello World!' << endl;";
      const pythonCode = "print('Hello World!')";

      dbMock.codeSubmission.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ language: "C++", code: cppCode })
        .mockResolvedValueOnce({ language: "PYTHON", code: pythonCode });

      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${languageList[0]}&language=${languageList[1]}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: 2,
        data: [
          {
            language: "C++",
            code: cppCode,
          },
          {
            language: "PYTHON",
            code: pythonCode,
          },
        ],
      });

      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(2);
    });
  });

  describe("Given a valid user id, a question id, and multiple languages in query params, but only one code submission found", () => {
    it("should return 200 with respective code", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const languageList = [
        encodeURIComponent("c++"),
        encodeURIComponent("python"),
      ];

      const cppCode = "cout << 'Hello World!' << endl;";

      dbMock.codeSubmission.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          language: "C++",
          code: cppCode,
        })
        .mockResolvedValueOnce(null);
      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${languageList[0]}&language=${languageList[1]}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: 1,
        data: [
          {
            language: "C++",
            code: cppCode,
          },
        ],
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(2);
    });
  });

  describe("Given a valid user id, a question id, and no language in query param", () => {
    it("should return 200 with a list of code submissions", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();

      const cppCode = "cout << 'Hello World!' << endl;";
      const pythonCode = "print('Hello World!')";
      const javaCode = "System.out.println('Hello World!');";

      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([
        { language: "C++", code: cppCode },
        { language: "PYTHON", code: pythonCode },
        { language: "JAVA", code: javaCode },
      ]);

      dbMock.codeSubmission.findFirst = jest.fn().mockResolvedValueOnce(null);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.OK);
      expect(body).toEqual({
        count: 3,
        data: [
          {
            language: "C++",
            code: cppCode,
          },
          {
            language: "PYTHON",
            code: pythonCode,
          },
          {
            language: "JAVA",
            code: javaCode,
          },
        ],
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(1);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(0);
    });
  });

  describe("Given a valid user id, a question id, and a language in query param, but no code submission found", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const language = encodeURIComponent("c++"); //take note that when using C++, encode it to c%2B%2B

      dbMock.codeSubmission.findFirst = jest.fn().mockResolvedValueOnce(null);
      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${language}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "No code submission found",
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(1);
    });
  });

  describe("Given a valid user id, a question id, and multiple languages in query params, but no code submission found", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const languageList = [
        encodeURIComponent("c++"),
        encodeURIComponent("python"),
      ];

      dbMock.codeSubmission.findFirst = jest.fn().mockResolvedValue(null);
      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValueOnce([]);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${languageList[0]}&language=${languageList[1]}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "No code submission found",
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(0);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(2);
    });
  });

  describe("Given a valid user id, a question id, and no language query param", () => {
    it("should return 404 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();

      dbMock.codeSubmission.findMany = jest.fn().mockResolvedValue([]);
      dbMock.codeSubmission.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: "No code submission found",
      });
    });
  });

  describe("Given an invalid language", () => {
    it("should return 400 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      const language = "invalid";

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code?language=${language}`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Invalid language",
      });
    });
  });

  describe("Given database is down", () => {
    it("should return 500 and an error message", async () => {
      // Arrange
      const userId = generateCUID();
      const questionId = generateCUID();
      dbMock.codeSubmission.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database is down"));
      dbMock.codeSubmission.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app).get(
        `/${API_PREFIX}/history/user/${userId}/question/${questionId}/code`
      );

      // Assert
      expect(statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(body).toEqual({
        error: "INTERNAL SERVER ERROR",
        message: "An unexpected error has occurred",
      });
      expect(dbMock.codeSubmission.findMany).toBeCalledTimes(1);
      expect(dbMock.codeSubmission.findFirst).toBeCalledTimes(0);
    });
  });
});
