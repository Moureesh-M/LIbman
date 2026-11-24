const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

let db;

function connectSqlite() {
  const configuredPath = process.env.SQLITE_PATH || "./data/library.db";
  const databasePath = path.resolve(process.cwd(), configuredPath);

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      member_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS borrowings (
      borrow_id INTEGER PRIMARY KEY,
      member_id INTEGER NOT NULL,
      book_id TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      return_date TEXT,
      FOREIGN KEY (member_id) REFERENCES members(member_id)
    );
  `);

  console.log(`Connected to SQLite at ${databasePath}`);
  return db;
}

function getSqlite() {
  if (!db) {
    throw new Error("SQLite database is not initialized");
  }
  return db;
}

module.exports = connectSqlite;
module.exports.getDb = getSqlite;
