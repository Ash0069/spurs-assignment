import type { Request, Response } from "express";
import { processChat } from "../services/chat.service.js";

export const handleChat = (req: Request, res: Response) => {
    const { message, conversationId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const result = processChat({ message, conversationId });
    res.json(result);
};
