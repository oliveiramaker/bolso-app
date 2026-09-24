export type TransactionType = "income" | "expense";
export type Frequency = "weekly" | "monthly" | "yearly";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string | null;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category_id: string | null;
  payment_method: string | null;
  installment_group_id: string | null;
  installment_number: number | null;
  recurrence_id: number | null;
  created_at: string;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string | null;
}

export interface Budget {
  id: number;
  category_id: string;
  category_name: string;
  amount: number;
  spent: number;
}
