import { Router } from "express";
import {
  createCategory,
  listCategories,
} from "../controllers/categoryController.js";
import { validateCreateCategoryRequest } from "../middleware/validateCategoryRequest.js";

const categoryRouter = Router();

categoryRouter.post("/", validateCreateCategoryRequest, createCategory);
categoryRouter.get("/", listCategories);

export default categoryRouter;
