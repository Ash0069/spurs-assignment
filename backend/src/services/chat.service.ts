import db from "../db/sqlite.js";
import { randomUUID } from "crypto";

export const processChat = ({ message, conversationId }: any) => {
  const convoId = conversationId ?? randomUUID();

  db.prepare(
    "INSERT OR IGNORE INTO conversations (id) VALUES (?)"
  ).run(convoId);

  db.prepare(
    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)"
  ).run(randomUUID(), convoId, "user", message);

  const reply = "This is a mock AI response.";

  db.prepare(
    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)"
  ).run(randomUUID(), convoId, "assistant", reply);

  return { conversationId: convoId, reply };
};