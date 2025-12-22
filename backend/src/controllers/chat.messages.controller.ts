import type { Request, Response } from "express";
import db from "../db/sqlite.js";

export const getMessages = (req: Request, res: Response) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json({ error: "conversationId required" });
    }

    const messages = db
        .prepare(
            `
      SELECT 
        id,
        role,
        content,
        created_at as timestamp
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `
        )
        .all(conversationId);

    res.json({ messages });
};
