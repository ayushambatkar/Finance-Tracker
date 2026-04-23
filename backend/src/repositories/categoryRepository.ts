import prisma from "../lib/prisma.js";
import type { Category } from "../generated/prisma/client.js";

export const categoryRepository = {
  findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  },

  create(name: string): Promise<Category> {
    return prisma.category.create({
      data: { name },
    });
  },

  list(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },
};
