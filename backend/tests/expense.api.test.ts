import { randomUUID } from "node:crypto";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Expense API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.expense.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns existing expense for reused idempotency key", async () => {
    const idempotencyKey = randomUUID();
    const payload = {
      amount: 199.99,
      category: "Food",
      description: "Lunch",
      date: new Date().toISOString(),
    };

    const firstResponse = await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    const secondResponse = await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);

    const allExpenses = await prisma.expense.findMany();
    expect(allExpenses).toHaveLength(1);
  });

  it("rejects negative amounts", async () => {
    const response = await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", randomUUID())
      .send({
        amount: -10,
        category: "utilities",
        description: "invalid",
        date: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
  });

  it("filters by category and sorts by newest date", async () => {
    const now = new Date();

    await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", randomUUID())
      .send({
        amount: 100,
        category: "Food",
        description: "Older",
        date: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      });

    await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", randomUUID())
      .send({
        amount: 200,
        category: "Travel",
        description: "Other",
        date: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      });

    await request(app)
      .post("/api/expenses")
      .set("Idempotency-Key", randomUUID())
      .send({
        amount: 150,
        category: "food",
        description: "Newest Food",
        date: now.toISOString(),
      });

    const response = await request(app).get(
      "/api/expenses?category=FOOD&sort=date_desc",
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].category).toBe("food");
    expect(response.body.data[1].category).toBe("food");
    expect(new Date(response.body.data[0].date).getTime()).toBeGreaterThan(
      new Date(response.body.data[1].date).getTime(),
    );
  });
});
