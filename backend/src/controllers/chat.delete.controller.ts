import type { Request, Response } from "express";
import db from "../db/sqlite.js";

export const deleteChat = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({ error: "conversationId required" });
        }

        // Delete messages
        await db.execute({
            sql: `DELETE FROM messages WHERE conversation_id = ?`,
            args: [conversationId],
        });

        // Delete conversation
        await db.execute({
            sql: `DELETE FROM conversations WHERE id = ?`,
            args: [conversationId],
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("Delete chat failed:", error);
        return res.status(500).json({ error: "Failed to delete conversation" });
    }
};