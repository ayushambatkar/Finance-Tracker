import { Prisma } from "../generated/prisma/client.js";
import type { Category } from "../generated/prisma/client.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import type { CreateCategoryCommand } from "../types/category.js";

interface CreateCategoryResult {
  category: Category;
  created: boolean;
}

const normalizeCategoryName = (name: string): string => name.trim().toLowerCase();

export const categoryService = {
  async createCategory(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
    const normalizedName = normalizeCategoryName(command.name);

    const existing = await categoryRepository.findByName(normalizedName);
    if (existing) {
      return { category: existing, created: false };
    }

    try {
      const category = await categoryRepository.create(normalizedName);
      return { category, created: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const racedCategory = await categoryRepository.findByName(normalizedName);
        if (racedCategory) {
          return { category: racedCategory, created: false };
        }
      }

      throw error;
    }
  },

  listCategories(): Promise<Category[]> {
    return categoryRepository.list();
  },
};
