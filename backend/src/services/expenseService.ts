import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/httpError.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import { expenseRepository } from "../repositories/expenseRepository.js";
import type { ExpenseWithCategory } from "../repositories/expenseRepository.js";
import type { CreateExpenseCommand, GetExpensesQuery } from "../types/expense.js";

interface CreateExpenseResult {
  expense: ExpenseWithCategory;
  created: boolean;
}

const normalizeDescription = (description: string): string => description.trim();

const toPaise = (amount: number): number => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  return Math.round(amount * 100);
};

const toUtcDate = (isoDateString: string): Date => {
  const parsedDate = new Date(isoDateString);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Date must be a valid ISO string.");
  }

  return parsedDate;
};

export const expenseService = {
  async createExpense(command: CreateExpenseCommand): Promise<CreateExpenseResult> {
    const category = await categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found.");
    }

    const existing = await expenseRepository.findByIdempotencyKey(command.idempotencyKey);

    if (existing) {
      return { expense: existing, created: false };
    }

    const data = {
      amount: toPaise(command.amount),
      categoryId: category.id,
      description: normalizeDescription(command.description),
      date: toUtcDate(command.date),
      idempotencyKey: command.idempotencyKey,
    };

    try {
      const createdExpense = await expenseRepository.create(data);
      return { expense: createdExpense, created: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const racedExpense = await expenseRepository.findByIdempotencyKey(command.idempotencyKey);
        if (racedExpense) {
          return { expense: racedExpense, created: false };
        }
      }

      throw error;
    }
  },

  listExpenses(query: GetExpensesQuery): Promise<ExpenseWithCategory[]> {
    return expenseRepository.list({ categoryId: query.categoryId });
  },

  deleteExpense(id: string): Promise<boolean> {
    return expenseRepository.deleteById(id);
  },
};
