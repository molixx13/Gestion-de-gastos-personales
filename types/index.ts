export interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  limit: number;
  created_at: string;
  category?: Category;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseCategories: CategorySummary[];
  incomeCategories: CategorySummary[];
}
