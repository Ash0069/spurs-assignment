import type { Request, Response } from "express";
import { processChat } from "../services/chat.service.js";
import { rateLimit } from "../services/rateLimit.service.js";

export const handleChat = async (req: Request, res: Response) => {
    try {
        const { message, conversationId } = req.body;

        // 🛑 1. Backend-level validation
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 🛡️ 2. Redis rate limit (Optional but recommended)
        const userIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const isLimited = await rateLimit(userIp.toString());

        if (isLimited) {
            return res.status(429).json({
                error: "Too many requests. Please slow down."
            });
        }

        // 🤖 3. Delegate to service layer
        const result = await processChat({
            message: message.trim(),
            conversationId,
        });

        return res.json(result);

    } catch (err) {
        console.error("Send message failed:", err);
        return res.status(500).json({ error: "Failed to process message" });
    }
};