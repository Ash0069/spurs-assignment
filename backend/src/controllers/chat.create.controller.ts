import type { Request, Response } from "express";
import db from "../db/sqlite.js";
import { randomUUID } from "crypto";

export const createChat = async (_req: Request, res: Response) => {
    try {
        const conversationId = randomUUID();

        await db.execute({
            sql: `INSERT INTO conversations (id) VALUES (?)`,
            args: [conversationId],
        });

        return res.status(201).json({
            conversationId,
        });
    } catch (error) {
        console.error("Create chat failed:", error);
        return res.status(500).json({ error: "Failed to create conversation" });
    }
};