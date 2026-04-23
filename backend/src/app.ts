import cors from "cors";
import express from "express";
import categoryRouter from "./routes/categoryRoutes.js";
import expenseRouter from "./routes/expenseRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/expenses", expenseRouter);
app.use("/api/categories", categoryRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

app.use(errorHandler);

export default app;
