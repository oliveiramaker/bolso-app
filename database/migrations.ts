import type { SQLiteDatabase } from "expo-sqlite";
export async function migrateDbIfNeeded(db:SQLiteDatabase){
 await db.execAsync(`
 PRAGMA journal_mode=WAL;
 PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS transactions(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   type TEXT NOT NULL CHECK(type IN ('income','expense')),
   description TEXT NOT NULL,
   amount REAL NOT NULL CHECK(amount>0),
   date TEXT NOT NULL,
   category_id TEXT,
   payment_method TEXT,
   installment_group_id INTEGER,
   installment_number INTEGER,
   created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
 CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
 CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
 CREATE TABLE IF NOT EXISTS budgets(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   category_id TEXT NOT NULL,
   amount REAL NOT NULL CHECK(amount>0),
   month TEXT NOT NULL,
   UNIQUE(category_id,month)
 );
 CREATE TABLE IF NOT EXISTS goals(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   name TEXT NOT NULL,
   target REAL NOT NULL CHECK(target>0),
   saved REAL NOT NULL DEFAULT 0 CHECK(saved>=0),
   deadline TEXT
 );
 `);
}