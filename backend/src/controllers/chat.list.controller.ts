import type { Request, Response } from "express";
import db from "../db/sqlite.js";

export const listChats = (_req: Request, res: Response) => {
    const chats = db.prepare(`
    SELECT
      c.id as conversationId,
      MAX(m.created_at) as updatedAt,
      (
        SELECT content
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) as lastMessage
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    GROUP BY c.id
    ORDER BY updatedAt DESC
  `).all();

    res.json(chats);
};