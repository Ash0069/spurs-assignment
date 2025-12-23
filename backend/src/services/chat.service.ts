import { redis } from "../redis/redisClient.js";
import { generateReply } from "./llm.service.js";
import db from "../db/sqlite.js";

interface ProcessChatInput {
  message: string;
  conversationId?: string;
}

export async function processChat({ message, conversationId }: ProcessChatInput) {
  // 1. Conversation ID assignment
  const convId = conversationId || crypto.randomUUID();

  // 2. Save user message to db
  db.prepare(
    `INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)`
  ).run(convId, message);

  // 3. Save to Redis cache (optional)
  if (redis) {
    await redis.rpush(`messages:${convId}`, JSON.stringify({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }));
    await redis.ltrim(`messages:${convId}`, -50, -1);
  }

  // 4. Generate LLM reply
  const reply = await generateReply([], message);

  // 5. Save reply to DB
  db.prepare(
    `INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)`
  ).run(convId, reply);

  // 6. Cache reply
  if (redis) {
    await redis.rpush(`messages:${convId}`, JSON.stringify({
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
    }));
    await redis.ltrim(`messages:${convId}`, -50, -1);
  }

  return {
    conversationId: convId,
    message: {
      id: Date.now(),
      role: "ai",
      content: reply,
      timestamp: new Date().toISOString(),
    },
  };
}
