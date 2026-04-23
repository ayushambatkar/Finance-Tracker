export interface CreateExpenseRequestBody {
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
}

export interface GetExpensesQuery {
  categoryId?: string;
  sort?: "date_desc";
}

export interface CreateExpenseCommand {
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  idempotencyKey: string;
}
