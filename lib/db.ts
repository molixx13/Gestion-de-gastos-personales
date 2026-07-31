import { createClient } from "@/lib/supabase/client";
import type { Category, Transaction, Budget, MonthlySummary, CategorySummary } from "@/types";

function getSupabase() {
  return createClient();
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Sesión no válida. Inicia sesión de nuevo.");
  return user.id;
}

export const categories = {
  async list(type?: "income" | "expense") {
    let query = getSupabase().from("categories").select("*").order("name");
    if (type) query = query.eq("type", type);
    const { data } = await query;
    return (data ?? []) as Category[];
  },

  async create(category: Omit<Category, "id" | "user_id" | "created_at">) {
    const user_id = await getUserId();
    const { data, error } = await getSupabase()
      .from("categories")
      .insert({ ...category, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async update(id: string, updates: Partial<Category>) {
    const { data, error } = await getSupabase()
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async remove(id: string) {
    const { error } = await getSupabase()
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const transactions = {
  async list(monthStart: string, monthEnd: string, categoryId?: string) {
    let query = getSupabase()
      .from("transactions")
      .select("*, category:categories(*)")
      .gte("date", monthStart)
      .lte("date", monthEnd)
      .order("date", { ascending: false });

    if (categoryId) query = query.eq("category_id", categoryId);

    const { data } = await query;
    return (data ?? []) as Transaction[];
  },

  async getById(id: string) {
    const { data } = await getSupabase()
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single();
    return data as Transaction | null;
  },

  async create(transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "category">) {
    const user_id = await getUserId();
    const { data, error } = await getSupabase()
      .from("transactions")
      .insert({ ...transaction, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as Transaction;
  },

  async update(id: string, updates: Partial<Transaction>) {
    const { data, error } = await getSupabase()
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Transaction;
  },

  async remove(id: string) {
    const { error } = await getSupabase()
      .from("transactions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async getMonthlySummary(monthStart: string, monthEnd: string): Promise<MonthlySummary> {
    const { data: allTransactions } = await getSupabase()
      .from("transactions")
      .select("*, category:categories(*)")
      .gte("date", monthStart)
      .lte("date", monthEnd);

    const tx = (allTransactions ?? []) as Transaction[];

    const totalIncome = tx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = tx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const groupByCategory = (
      type: "income" | "expense",
    ): CategorySummary[] => {
      const byCategory = new Map<string, { category: Category; total: number; count: number }>();

      tx.filter((t) => t.type === type).forEach((t) => {
        if (!t.category) return;
        const existing = byCategory.get(t.category_id);
        if (existing) {
          existing.total += t.amount;
          existing.count += 1;
        } else {
          byCategory.set(t.category_id, {
            category: t.category,
            total: t.amount,
            count: 1,
          });
        }
      });

      const typeTotal = type === "income" ? totalIncome : totalExpense;

      return Array.from(byCategory.values())
        .map((c) => ({
          category: c.category,
          total: c.total,
          percentage: typeTotal > 0 ? (c.total / typeTotal) * 100 : 0,
          transactionCount: c.count,
        }))
        .sort((a, b) => b.total - a.total);
    };

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expenseCategories: groupByCategory("expense"),
      incomeCategories: groupByCategory("income"),
    };
  },
};

export const budgets = {
  async getCurrentMonth(month: string) {
    const { data } = await getSupabase()
      .from("budgets")
      .select("*, category:categories(*)")
      .eq("month", month);
    return (data ?? []) as Budget[];
  },

  async upsert(budget: Omit<Budget, "id" | "user_id" | "created_at">) {
    const user_id = await getUserId();
    const { data, error } = await getSupabase()
      .from("budgets")
      .upsert({ ...budget, user_id })
      .select()
      .single();
    if (error) throw error;
    return data as Budget;
  },
};
