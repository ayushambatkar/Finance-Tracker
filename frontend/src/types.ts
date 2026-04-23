export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: Category;
  description: string;
  date: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
}

export interface CreateCategoryInput {
  name: string;
}
