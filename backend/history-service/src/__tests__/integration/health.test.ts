import supertest from "supertest";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import createUnitTestServer from "../utils/server";

const app = createUnitTestServer();

describe("GET /health", () => {
  it("should return 200 with a message in json", async () => {});
});
