import { eq, desc } from "drizzle-orm";
import { getDb } from "./index";
import { settings, sessions, messages, snapshots, progress } from "./schema";

// Settings
export function getSetting(key: string): string | undefined {
  const db = getDb();
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

// Sessions
export function createSession(data: {
  id: string;
  topic: string;
  level: string;
  goal: string;
  jd?: string;
}) {
  const db = getDb();
  return db
    .insert(sessions)
    .values({
      ...data,
      startedAt: Date.now(),
    })
    .returning()
    .get();
}

export function getSession(id: string) {
  const db = getDb();
  return db.select().from(sessions).where(eq(sessions.id, id)).get();
}

export function updateSession(
  id: string,
  data: Partial<{
    endedAt: number;
    summary: string;
    scores: string;
  }>
) {
  const db = getDb();
  return db.update(sessions).set(data).where(eq(sessions.id, id)).run();
}

export function listSessions() {
  const db = getDb();
  return db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.startedAt))
    .all();
}

// Messages
export function addMessage(data: {
  id: string;
  sessionId: string;
  role: string;
  content: string;
}) {
  const db = getDb();
  return db
    .insert(messages)
    .values({
      ...data,
      createdAt: Date.now(),
    })
    .returning()
    .get();
}

export function getMessages(sessionId: string) {
  const db = getDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt)
    .all();
}

// Snapshots
export function addSnapshot(data: {
  id: string;
  sessionId: string;
  imageBlob?: Buffer;
  description?: string;
}) {
  const db = getDb();
  return db
    .insert(snapshots)
    .values({
      ...data,
      createdAt: Date.now(),
    })
    .returning()
    .get();
}

export function getSnapshots(sessionId: string) {
  const db = getDb();
  return db
    .select()
    .from(snapshots)
    .where(eq(snapshots.sessionId, sessionId))
    .orderBy(snapshots.createdAt)
    .all();
}

// Progress
export function addProgress(data: {
  id: string;
  sessionId: string;
  dimension: string;
  score: number;
  feedback?: string;
}) {
  const db = getDb();
  return db
    .insert(progress)
    .values({
      ...data,
      createdAt: Date.now(),
    })
    .returning()
    .get();
}

export function getProgressBySession(sessionId: string) {
  const db = getDb();
  return db
    .select()
    .from(progress)
    .where(eq(progress.sessionId, sessionId))
    .all();
}

export function getAllProgress() {
  const db = getDb();
  return db
    .select()
    .from(progress)
    .orderBy(desc(progress.createdAt))
    .all();
}
