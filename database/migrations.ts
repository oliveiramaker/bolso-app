import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 2;

const categories = [
  ["alimentacao","Alimentação","restaurant","expense"],
  ["moradia","Moradia","home","expense"],
  ["transporte","Transporte","car","expense"],
  ["saude","Saúde","heart","expense"],
  ["educacao","Educação","school","expense"],
  ["lazer","Lazer","game-controller","expense"],
  ["compras","Compras","bag-handle","expense"],
  ["assinaturas","Assinaturas","repeat","expense"],
  ["outros","Outros","ellipsis-horizontal","expense"],
  ["salario","Salário","briefcase","income"],
  ["freelance","Freelance","cash","income"],
  ["investimentos","Investimentos","trending-up","income"],
  ["outras-entradas","Outras entradas","add-circle","income"]
] as const;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let version = row?.user_version ?? 0;

  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income','expense')),
        color TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income','expense')),
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        category_id TEXT,
        payment_method TEXT,
        installment_group_id TEXT,
        installment_number INTEGER,
        recurrence_id INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        month TEXT NOT NULL,
        UNIQUE(category_id, month),
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        target REAL NOT NULL CHECK(target > 0),
        saved REAL NOT NULL DEFAULT 0 CHECK(saved >= 0),
        deadline TEXT
      );

      CREATE TABLE IF NOT EXISTS goal_contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        note TEXT,
        FOREIGN KEY(goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income','expense')),
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        category_id TEXT,
        payment_method TEXT,
        frequency TEXT NOT NULL CHECK(frequency IN ('monthly','weekly','yearly')),
        next_date TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
      CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
      CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON goal_contributions(goal_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_next_date ON recurring_transactions(next_date);
    `);
    version = 1;
  }

  if (version < 2) {
    for (const [id, name, icon, type] of categories) {
      await db.runAsync(
        "INSERT OR IGNORE INTO categories (id,name,icon,type) VALUES (?,?,?,?)",
        id, name, icon, type
      );
    }
    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
