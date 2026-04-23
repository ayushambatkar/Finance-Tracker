import type {
  Category,
  CreateCategoryInput,
  CreateExpenseInput,
  Expense,
} from "./types";

const EXPENSES_ENDPOINT = "/api/expenses";
const CATEGORIES_ENDPOINT = "/api/categories";

const readResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return payload.data as T;
};

export const fetchExpenses = async (categoryId?: string): Promise<Expense[]> => {
  const query = new URLSearchParams();
  query.set("sort", "date_desc");

  if (categoryId) {
    query.set("categoryId", categoryId);
  }

  const response = await fetch(`${EXPENSES_ENDPOINT}?${query.toString()}`);
  return readResponse<Expense[]>(response);
};

export const createExpense = async (
  input: CreateExpenseInput,
  idempotencyKey: string,
): Promise<Expense> => {
  const response = await fetch(EXPENSES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });

  return readResponse<Expense>(response);
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(CATEGORIES_ENDPOINT);
  return readResponse<Category[]>(response);
};

export const createCategory = async (
  input: CreateCategoryInput,
): Promise<Category> => {
    console.log("Creating category with input:", input);
  const response = await fetch(CATEGORIES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readResponse<Category>(response);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${EXPENSES_ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  await readResponse<{ success: boolean }>(response);
};
