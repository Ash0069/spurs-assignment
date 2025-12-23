import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";

export const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create conversations table
await db.execute({
  sql: `
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT,
      last_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
});

// Create messages table
await db.execute({
  sql: `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT CHECK(role IN ('user','assistant')) NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
  `,
});

export default db;