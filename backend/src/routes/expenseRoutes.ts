import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  listExpenses,
} from "../controllers/expenseController.js";
import {
  validateCreateExpenseRequest,
  validateGetExpensesRequest,
} from "../middleware/validateExpenseRequest.js";

const expenseRouter = Router();

expenseRouter.post("/", validateCreateExpenseRequest, createExpense);
expenseRouter.get("/", validateGetExpensesRequest, listExpenses);
expenseRouter.delete("/:id", deleteExpense);

export default expenseRouter;
