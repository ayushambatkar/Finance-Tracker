import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createCategory,
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenses,
} from "./api";
import type { Category, Expense } from "./types";
import "./App.css";

interface FormState {
  amount: string;
  categoryId: string;
  description: string;
  date: string;
}

const toDatetimeLocal = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

const formatCurrency = (amountInPaise: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amountInPaise / 100);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong.";

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [activeFilterCategoryId, setActiveFilterCategoryId] = useState("");
  const [filterDraftCategoryId, setFilterDraftCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [retryIdempotencyKey, setRetryIdempotencyKey] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    amount: "",
    categoryId: "",
    description: "",
    date: toDatetimeLocal(new Date()),
  });

  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    setCategoryError("");

    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      setCategoryError(getErrorMessage(error));
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  const loadExpenses = useCallback(async (categoryId?: string) => {
    setIsFetching(true);
    setFetchError("");

    try {
      const data = await fetchExpenses(categoryId);
      setExpenses(data);
    } catch (error) {
      setFetchError(getErrorMessage(error));
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadExpenses(activeFilterCategoryId || undefined);
  }, [activeFilterCategoryId, loadExpenses]);

  const totalVisible = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const totalsByCategory = useMemo(() => {
    return expenses.reduce<Record<string, number>>((accumulator, expense) => {
      const categoryName = expense.category.name;
      accumulator[categoryName] =
        (accumulator[categoryName] ?? 0) + expense.amount;
      return accumulator;
    }, {});
  }, [expenses]);

  const onFieldChange =
    (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Amount must be greater than zero.");
      return;
    }

    if (!form.categoryId) {
      setSubmitError("Category is required.");
      return;
    }

    const parsedDate = new Date(form.date);
    if (Number.isNaN(parsedDate.getTime())) {
      setSubmitError("Date must be valid.");
      return;
    }

    const idempotencyKey = retryIdempotencyKey ?? crypto.randomUUID();

    setRetryIdempotencyKey(idempotencyKey);
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createExpense(
        {
          amount,
          categoryId: form.categoryId,
          description: form.description,
          date: parsedDate.toISOString(),
        },
        idempotencyKey,
      );

      setRetryIdempotencyKey(null);
      setForm({
        amount: "",
        categoryId: form.categoryId,
        description: "",
        date: toDatetimeLocal(new Date()),
      });

      await loadExpenses(activeFilterCategoryId || undefined);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExpense = async (id: string) => {
    setDeletingIds((current) => new Set(current).add(id));

    try {
      await deleteExpense(id);
      await loadExpenses(activeFilterCategoryId || undefined);
    } catch (error) {
      setFetchError(getErrorMessage(error));
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    setIsCreatingCategory(true);
    setCategoryError("");

    try {
      const createdCategory = await createCategory({ name: newCategoryName });
      setNewCategoryName("");
      await loadCategories();

      setForm((current) => ({
        ...current,
        categoryId: createdCategory.id,
      }));
    } catch (error) {
      setCategoryError(getErrorMessage(error));
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const applyFilter = () => {
    setActiveFilterCategoryId(filterDraftCategoryId);
  };

  const clearFilter = () => {
    setFilterDraftCategoryId("");
    setActiveFilterCategoryId("");
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      )),
    [categories],
  );

  return (
    <main className="page">
      <section className="hero">
        <h1>Expense Tracker</h1>
        <p>Capture spending quickly, keep duplicates out, and stay accurate to the paise.</p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Add Expense</h2>
          <form className="form" onSubmit={submitExpense}>
            <div className="form-row">
              <label>
                Amount (INR)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={onFieldChange("amount")}
                  placeholder="e.g. 250.50"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={form.categoryId}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }));
                  }}
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions}
                </select>
              </label>
            </div>

            <div>
              <form className="inline" onSubmit={submitCategory}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Create category"
                />
                <button
                  className="secondary"
                  type="submit"
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? "Creating..." : "Add"}
                </button>
              </form>
              {isCategoriesLoading && <div className="loader">Loading categories...</div>}
              {categoryError && <div className="error">{categoryError}</div>}
            </div>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={onFieldChange("description")}
                placeholder="Optional note"
              />
            </label>

            <label>
              Date and time
              <input
                type="datetime-local"
                value={form.date}
                onChange={onFieldChange("date")}
                required
              />
            </label>

            <button className="primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>

            {submitError && <div className="error">{submitError}</div>}
          </form>
        </article>

        <article className="card">
          <h2>Summary</h2>
          <p className="total">Visible Total: {formatCurrency(totalVisible)}</p>
          {Object.keys(totalsByCategory).length === 0 ? (
            <p className="empty">No expenses in current view.</p>
          ) : (
            <ul className="summary-list">
              {Object.entries(totalsByCategory)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([category, amount]) => (
                  <li className="summary-item" key={category}>
                    <span>{category}</span>
                    <span>{formatCurrency(amount)}</span>
                  </li>
                ))}
            </ul>
          )}
        </article>
      </section>

      <section className="card">
        <div className="meta">
          <h2>Expenses</h2>
          <div className="inline">
            <select
              value={filterDraftCategoryId}
              onChange={(event) => setFilterDraftCategoryId(event.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions}
            </select>
            <button className="secondary" type="button" onClick={applyFilter}>
              Apply
            </button>
            <button className="secondary" type="button" onClick={clearFilter}>
              Clear
            </button>
          </div>
        </div>

        {isFetching && <div className="loader">Loading expenses...</div>}

        {fetchError && (
          <div className="error inline">
            <span>{fetchError}</span>
            <button
              className="secondary"
              type="button"
              onClick={() => void loadExpenses(activeFilterCategoryId || undefined)}
            >
              Retry
            </button>
          </div>
        )}

        {!isFetching && expenses.length === 0 ? (
          <p className="empty">No expenses found for this filter.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{expense.category.name}</td>
                    <td>{expense.description || "-"}</td>
                    <td>{new Date(expense.date).toLocaleString()}</td>
                    <td>
                      <button
                        className="danger"
                        type="button"
                        disabled={deletingIds.has(expense.id)}
                        onClick={() => void removeExpense(expense.id)}
                      >
                        {deletingIds.has(expense.id) ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
