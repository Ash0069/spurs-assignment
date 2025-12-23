import { redis } from "../redis/redisClient.js";
import { generateReply } from "./llm.service.js";
import db from "../db/sqlite.js";
import crypto from "crypto";

interface ProcessChatInput {
  message: string;
  conversationId?: string;
}

export async function processChat({ message, conversationId }: ProcessChatInput) {
  // 1️⃣ Use provided conversationId or create a new one
  const convId = conversationId || crypto.randomUUID();

  // 2️⃣ Ensure conversation exists (Turso allows safe INSERT OR IGNORE)
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO conversations (id, title)
      VALUES (?, ?)
    `,
    args: [convId, "Chat"],
  });

  const timestamp = new Date().toISOString();

  // 3️⃣ Save user message in Turso
  await db.execute({
    sql: `
      INSERT INTO messages (id, conversation_id, role, content, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `,
    args: [crypto.randomUUID(), convId, message, timestamp],
  });

  // 4️⃣ Cache user message in Redis
  if (redis) {
    const key = `messages:${convId}`;
    await redis.rpush(
      key,
      JSON.stringify({
        role: "user",
        content: message,
        timestamp,
      })
    );
    await redis.ltrim(key, -50, -1);
  }

  // 5️⃣ Get AI reply
  const reply = await generateReply([], message);
  const replyTimestamp = new Date().toISOString();

  // 6️⃣ Save assistant reply to Turso
  await db.execute({
    sql: `
      INSERT INTO messages (id, conversation_id, role, content, created_at)
      VALUES (?, ?, 'assistant', ?, ?)
    `,
    args: [crypto.randomUUID(), convId, reply, replyTimestamp],
  });

  // 7️⃣ Cache assistant reply in Redis
  if (redis) {
    const key = `messages:${convId}`;
    await redis.rpush(
      key,
      JSON.stringify({
        role: "assistant",
        content: reply,
        timestamp: replyTimestamp,
      })
    );
    await redis.ltrim(key, -50, -1);
  }

  // 8️⃣ Return to frontend
  return {
    conversationId: convId,
    message: {
      id: Date.now(), // frontend uses this, DB has UUID
      role: "ai",
      content: reply,
      timestamp: replyTimestamp,
    },
  };
}