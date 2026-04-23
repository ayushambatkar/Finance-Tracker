import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
});

export const validateCreateCategoryRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const bodyValidation = createCategoryBodySchema.safeParse(req.body);
  if (!bodyValidation.success) {
    res.status(400).json({
      error: "Invalid request body.",
      details: bodyValidation.error.flatten(),
    });
    return;
  }

  req.body = bodyValidation.data;
  next();
};
