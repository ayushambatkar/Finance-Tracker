import type { NextFunction, Request, Response } from "express";
import { expenseService } from "../services/expenseService.js";
import type { CreateExpenseRequestBody, GetExpensesQuery } from "../types/expense.js";

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateExpenseRequestBody;
    const idempotencyKey = req.header("Idempotency-Key") as string;

    const result = await expenseService.createExpense({
      amount: body.amount,
      categoryId: body.categoryId,
      description: body.description ?? "",
      date: body.date,
      idempotencyKey,
    });

    res.status(result.created ? 201 : 200).json({
      data: result.expense,
      idempotentReplay: !result.created,
    });
  } catch (error) {
    next(error);
  }
};

export const listExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query: GetExpensesQuery = {
      categoryId:
        typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
      sort: req.query.sort === "date_desc" ? "date_desc" : undefined,
    };
    const expenses = await expenseService.listExpenses(query);

    res.json({
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.params.id) {
      res.status(400).json({
        error: "Expense ID is required.",
      });
      return;
    }
    const expenseId = String(req.params.id);
    const deleted = await expenseService.deleteExpense(expenseId);

    if (!deleted) {
      res.status(404).json({
        error: "Expense not found.",
      });
      return;
    }

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
