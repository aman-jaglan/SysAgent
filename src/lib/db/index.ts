import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as schema from "./schema";

function getDbPath() {
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  return join(dataDir, "sysagent.db");
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const dbPath = getDbPath();
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Auto-create tables on first run
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      level TEXT NOT NULL,
      goal TEXT NOT NULL,
      jd TEXT,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      summary TEXT,
      scores TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS messages_session_idx ON messages(session_id);
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      image_blob BLOB,
      description TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS snapshots_session_idx ON snapshots(session_id);
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      dimension TEXT NOT NULL,
      score INTEGER NOT NULL,
      feedback TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS progress_session_idx ON progress(session_id);
    CREATE INDEX IF NOT EXISTS progress_dimension_idx ON progress(dimension);
  `);

  return drizzle(sqlite, { schema });
}

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export type DbType = ReturnType<typeof getDb>;
