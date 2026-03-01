import { sqliteTable, text, integer, blob, index } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  level: text("level").notNull(), // 'junior' | 'mid' | 'senior'
  goal: text("goal").notNull(),
  jd: text("jd"),
  startedAt: integer("started_at").notNull(),
  endedAt: integer("ended_at"),
  summary: text("summary"),
  scores: text("scores"), // JSON string of SessionScore
});

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id),
    role: text("role").notNull(), // 'user' | 'assistant' | 'system'
    content: text("content").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("messages_session_idx").on(table.sessionId)]
);

export const snapshots = sqliteTable(
  "snapshots",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id),
    imageBlob: blob("image_blob"),
    description: text("description"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("snapshots_session_idx").on(table.sessionId)]
);

export const progress = sqliteTable(
  "progress",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id),
    dimension: text("dimension").notNull(),
    score: integer("score").notNull(),
    feedback: text("feedback"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("progress_session_idx").on(table.sessionId),
    index("progress_dimension_idx").on(table.dimension),
  ]
);
