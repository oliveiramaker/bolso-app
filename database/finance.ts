import type { SQLiteDatabase } from "expo-sqlite";
import type { Budget, Category, Goal, Transaction, TransactionType } from "./types";

export function localDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonth(date = new Date()) {
  return localDate(date).slice(0, 7);
}

export async function getCategories(db: SQLiteDatabase, type?: TransactionType) {
  if (type) {
    return db.getAllAsync<Category>(
      "SELECT * FROM categories WHERE type = ? ORDER BY name", type
    );
  }
  return db.getAllAsync<Category>("SELECT * FROM categories ORDER BY type,name");
}

export async function getMonthTransactions(db: SQLiteDatabase, month: string) {
  return db.getAllAsync<Transaction & { category_name: string | null }>(
    `SELECT t.*, c.name AS category_name
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE substr(t.date,1,7)=?
     ORDER BY t.date DESC, t.id DESC`, month
  );
}

export async function getMonthSummary(db: SQLiteDatabase, month: string) {
  return db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS expense
     FROM transactions WHERE substr(date,1,7)=?`, month
  );
}

export async function deleteTransaction(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM transactions WHERE id=?", id);
}

export async function updateTransaction(
  db: SQLiteDatabase,
  id: number,
  values: { type: TransactionType; description: string; amount: number; date: string; categoryId: string | null; paymentMethod: string | null }
) {
  await db.runAsync(
    "UPDATE transactions SET type=?,description=?,amount=?,date=?,category_id=?,payment_method=? WHERE id=?",
    values.type, values.description, values.amount, values.date, values.categoryId,
    values.paymentMethod, id
  );
}

export async function insertTransaction(
  db: SQLiteDatabase,
  values: { type: TransactionType; description: string; amount: number; date: string; categoryId: string | null; paymentMethod: string | null }
) {
  return db.runAsync(
    "INSERT INTO transactions (type,description,amount,date,category_id,payment_method) VALUES (?,?,?,?,?,?)",
    values.type, values.description, values.amount, values.date, values.categoryId, values.paymentMethod
  );
}

export async function createInstallments(
  db: SQLiteDatabase,
  values: { type: TransactionType; description: string; totalAmount: number; date: string; categoryId: string | null; paymentMethod: string | null; installments: number }
) {
  const group = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const value = Math.round((values.totalAmount / values.installments) * 100) / 100;
  const lastValue = Math.round((values.totalAmount - value * (values.installments - 1)) * 100) / 100;
  for (let i = 0; i < values.installments; i++) {
    const d = new Date(values.date + "T12:00:00");
    d.setMonth(d.getMonth() + i);
    const amount = i === values.installments - 1 ? lastValue : value;
    await db.runAsync(
      "INSERT INTO transactions (type,description,amount,date,category_id,payment_method,installment_group_id,installment_number) VALUES (?,?,?,?,?,?,?,?)",
      values.type, `${values.description} (${i + 1}/${values.installments})`,
      amount, localDate(d), values.categoryId, values.paymentMethod, group, i + 1
    );
  }
}

export async function getBudgets(db: SQLiteDatabase, month: string) {
  return db.getAllAsync<Budget>(
    `SELECT b.id,b.category_id,c.name AS category_name,b.amount,
      COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount ELSE 0 END),0) AS spent
     FROM budgets b
     JOIN categories c ON c.id=b.category_id
     LEFT JOIN transactions t ON t.category_id=b.category_id AND substr(t.date,1,7)=?
     WHERE b.month=? GROUP BY b.id ORDER BY c.name`, month, month
  );
}

export async function saveBudget(db: SQLiteDatabase, categoryId: string, amount: number, month: string) {
  await db.runAsync(
    "INSERT INTO budgets(category_id,amount,month) VALUES(?,?,?) ON CONFLICT(category_id,month) DO UPDATE SET amount=excluded.amount",
    categoryId, amount, month
  );
}

export async function deleteBudget(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM budgets WHERE id=?", id);
}

export async function getGoals(db: SQLiteDatabase) {
  return db.getAllAsync<Goal>("SELECT * FROM goals ORDER BY deadline IS NULL, deadline");
}

export async function createGoal(db: SQLiteDatabase, name: string, target: number, deadline: string | null) {
  return db.runAsync("INSERT INTO goals(name,target,deadline) VALUES(?,?,?)", name, target, deadline);
}

export async function updateGoal(db: SQLiteDatabase, id: number, name: string, target: number, deadline: string | null) {
  await db.runAsync("UPDATE goals SET name=?,target=?,deadline=? WHERE id=?", name, target, deadline, id);
}

export async function deleteGoal(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM goals WHERE id=?", id);
}

export async function addGoalContribution(db: SQLiteDatabase, goalId: number, amount: number, note: string) {
  await db.runAsync(
    "INSERT INTO goal_contributions(goal_id,amount,date,note) VALUES(?,?,?,?)",
    goalId, amount, localDate(), note || null
  );
  await db.runAsync("UPDATE goals SET saved=saved+? WHERE id=?", amount, goalId);
}

export async function deleteAllData(db: SQLiteDatabase) {
  await db.execAsync("DELETE FROM goal_contributions; DELETE FROM transactions; DELETE FROM budgets; DELETE FROM goals;");
}


export async function restoreBackup(db: SQLiteDatabase, data: any) {
  if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.budgets) || !Array.isArray(data.goals)) {
    throw new Error("Backup inválido");
  }
  await db.execAsync("DELETE FROM goal_contributions; DELETE FROM transactions; DELETE FROM budgets; DELETE FROM goals; DELETE FROM recurring_transactions;");
  for (const t of data.transactions) {
    await db.runAsync(
      "INSERT INTO transactions(id,type,description,amount,date,category_id,payment_method,installment_group_id,installment_number,recurrence_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      t.id,t.type,t.description,t.amount,t.date,t.category_id ?? null,t.payment_method ?? null,t.installment_group_id ?? null,t.installment_number ?? null,t.recurrence_id ?? null,t.created_at ?? new Date().toISOString()
    );
  }
  for (const b of data.budgets) await db.runAsync("INSERT INTO budgets(id,category_id,amount,month) VALUES(?,?,?,?)",b.id,b.category_id,b.amount,b.month);
  for (const g of data.goals) await db.runAsync("INSERT INTO goals(id,name,target,saved,deadline) VALUES(?,?,?,?,?)",g.id,g.name,g.target,g.saved,g.deadline ?? null);
  if (Array.isArray(data.contributions)) for (const c of data.contributions) await db.runAsync("INSERT INTO goal_contributions(id,goal_id,amount,date,note) VALUES(?,?,?,?,?)",c.id,c.goal_id,c.amount,c.date,c.note ?? null);
  if (Array.isArray(data.recurring)) for (const r of data.recurring) await db.runAsync("INSERT INTO recurring_transactions(id,type,description,amount,category_id,payment_method,frequency,next_date,active) VALUES(?,?,?,?,?,?,?,?,?)",r.id,r.type,r.description,r.amount,r.category_id ?? null,r.payment_method ?? null,r.frequency,r.next_date,r.active ?? 1);
}
