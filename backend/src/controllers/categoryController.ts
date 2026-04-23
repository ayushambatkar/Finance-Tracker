import type { NextFunction, Request, Response } from "express";
import { categoryService } from "../services/categoryService.js";
import type { CreateCategoryRequestBody } from "../types/category.js";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateCategoryRequestBody;

    const result = await categoryService.createCategory({
      name: body.name,
    });

    res.status(result.created ? 201 : 200).json({
      data: result.category,
      created: result.created,
    });
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await categoryService.listCategories();

    res.json({
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
