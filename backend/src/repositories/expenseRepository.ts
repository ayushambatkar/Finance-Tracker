import prisma from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

export type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: { category: true };
}>;

interface CreateExpenseData {
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  idempotencyKey: string;
}

interface ListExpensesOptions {
  categoryId?: string;
}

export const expenseRepository = {
  findByIdempotencyKey(idempotencyKey: string): Promise<ExpenseWithCategory | null> {
    return prisma.expense.findUnique({
      where: { idempotencyKey },
      include: { category: true },
    });
  },

  create(data: CreateExpenseData): Promise<ExpenseWithCategory> {
    return prisma.expense.create({
      data,
      include: { category: true },
    });
  },

  list(options: ListExpensesOptions): Promise<ExpenseWithCategory[]> {
    return prisma.expense.findMany({
      where: options.categoryId ? { categoryId: options.categoryId } : undefined,
      orderBy: { date: "desc" },
      include: { category: true },
    });
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await prisma.expense.deleteMany({
      where: { id },
    });

    return result.count > 0;
  },
};
