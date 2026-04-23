import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createExpenseBodySchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  categoryId: z.string().cuid("Category ID must be valid."),
  description: z.string().trim().optional(),
  date: z.string().datetime({
    offset: true,
    message: "Date must be a valid ISO string.",
  }),
});

const createExpenseHeadersSchema = z.object({
  "idempotency-key": z
    .string()
    .uuid("Idempotency-Key header must be a valid UUID."),
});

const getExpensesQuerySchema = z.object({
  categoryId: z.string().cuid("Category ID must be valid.").optional(),
  sort: z.literal("date_desc").optional(),
});

export const validateCreateExpenseRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const bodyValidation = createExpenseBodySchema.safeParse(req.body);
  if (!bodyValidation.success) {
    res.status(400).json({
      error: "Invalid request body.",
      details: bodyValidation.error.flatten(),
    });
    return;
  }

  const headerValidation = createExpenseHeadersSchema.safeParse({
    "idempotency-key": req.header("Idempotency-Key"),
  });

  if (!headerValidation.success) {
    res.status(400).json({
      error: "Invalid request headers.",
      details: headerValidation.error.flatten(),
    });
    return;
  }

  req.body = bodyValidation.data;
  next();
};

export const validateGetExpensesRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const queryValidation = getExpensesQuerySchema.safeParse(req.query);
  if (!queryValidation.success) {
    res.status(400).json({
      error: "Invalid query parameters.",
      details: queryValidation.error.flatten(),
    });
    return;
  }
  next();
};
