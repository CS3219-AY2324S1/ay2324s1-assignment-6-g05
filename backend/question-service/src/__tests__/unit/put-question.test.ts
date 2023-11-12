import supertest from "supertest";
import createUnitTestServer from "../utils/server";
import * as TestPayload from "../utils/payloads";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../models/db";

const app = createUnitTestServer();
const dbMock = db as jest.Mocked<typeof db>;

const API_PREFIX = `question/api`;

describe("PUT /${API_PREFIX}/questions/:questionId", () => {
  describe("Given a valid request body", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const questionId = "existingquestionid123";
      const updateQuestionRequestBody =
        TestPayload.getCreateQuestionRequestBody();
      const question = TestPayload.getQuestionPayload(questionId);
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValueOnce(question)
        .mockResolvedValue(null);
      dbMock.question.update = jest.fn().mockResolvedValue(null);
      dbMock.example.deleteMany = jest.fn().mockResolvedValue(null);
      dbMock.example.createMany = jest.fn().mockResolvedValue(null);

      // Act
      const { statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/questions/${questionId}`)
        .send(updateQuestionRequestBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NO_CONTENT);
    });
  });

  describe("Given the questionId does not exist", () => {
    it("should return 404 with a not found message", async () => {
      // Arrange
      const questionId = "nonexistingquestionid123";
      const updateQuestionRequestBody =
        TestPayload.getCreateQuestionRequestBody();
      dbMock.question.findFirst = jest.fn().mockResolvedValue(null);

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/questions/${questionId}`)
        .send(updateQuestionRequestBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.NOT_FOUND);
      expect(body).toEqual({
        error: "NOT FOUND",
        message: `Question with id ${questionId} not found.`,
      });
    });
  });

  describe("Given the question title already exists", () => {
    it("should return 409 with a conflict message", async () => {
      // Arrange
      const questionId = "existingquestionid123";
      const updateQuestionRequestBody =
        TestPayload.getCreateQuestionRequestBody();
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValueOnce(TestPayload.getQuestionPayload(questionId))
        .mockResolvedValue(TestPayload.getQuestionPayload());

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/questions/${questionId}`)
        .send(updateQuestionRequestBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.CONFLICT);
      expect(body).toEqual({
        error: "CONFLICT",
        message: "Question title already exists",
      });
    });
  });

  describe("Given the question description is too short", () => {
    it("should return 400 with a zod error message indicating that the description is too short", async () => {
      // Arrange
      const questionId = "existingquestionid123";
      const updateQuestionRequestBody =
        TestPayload.getCreateQuestionRequestBody();
      updateQuestionRequestBody.description = "a";
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValue(TestPayload.getQuestionPayload(questionId));

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/questions/${questionId}`)
        .send(updateQuestionRequestBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body.message).toEqual(
        "Invalid description. String must contain at least 3 character(s)"
      );
    });
  });

  describe("Given the description contains all HTML new line tags", () => {
    it("should return 400 with a zod error message indicating that the description is too short", async () => {
      // Arrange
      const questionId = "existingquestionid123";
      const updateQuestionRequestBody =
        TestPayload.getCreateQuestionRequestBody();
      updateQuestionRequestBody.description = "<br /><br /><br />";
      dbMock.question.findFirst = jest
        .fn()
        .mockResolvedValue(TestPayload.getQuestionPayload(questionId));

      // Act
      const { body, statusCode } = await supertest(app)
        .put(`/${API_PREFIX}/questions/${questionId}`)
        .send(updateQuestionRequestBody);

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body.message).toEqual(
        "Invalid description. String must contain at least 3 character(s)"
      );
    });
  });

  describe("Given an empty request body", () => {
    it("should return 400 with an empty request body alert message", async () => {
      // Arrange
      const questionId = "existingquestionid123";

      // Act
      const { body, statusCode } = await supertest(app).put(
        `/${API_PREFIX}/questions/${questionId}`
      );

      // Assert
      expect(statusCode).toEqual(HttpStatusCode.BAD_REQUEST);
      expect(body).toEqual({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
    });
  });
});
