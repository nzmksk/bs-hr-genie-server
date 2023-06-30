const request = require("supertest");
const app = require("../../../../server.js");

describe("POST /login", () => {
  test("Valid credentials should return status 200, success message, and access token", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "superadmin", password: "123456789012" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful.");
    expect(response.body.token).toBeDefined();
  });
});
