import type { Request, Response } from "express";
import db from "../db/sqlite.js";

export const listChats = async (_req: Request, res: Response) => {
  try {
    const result = await db.execute({
      sql: `
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
                ORDER BY updatedAt DESC;
            `,
    });

    return res.json(result.rows);
  } catch (error) {
    console.error("Failed to list chats:", error);
    return res.status(500).json({ error: "Failed to list conversations" });
  }
};