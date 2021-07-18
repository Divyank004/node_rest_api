const request = require("supertest");
const app = require("../index");

describe("getRevenue path", () => {
  test("getRevenue GET method - positive", () => {
    return request(app).get("/1/revenue/monthly").expect(200);
  });
});
