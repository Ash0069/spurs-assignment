import type { Request, Response } from "express";
import db from "../db/sqlite.js";
import { redis } from "../redis/redisClient.js";

export const getMessages = async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json({ error: "conversationId required" });
    }

    try {
        // 1️⃣ Try Redis cache
        if (redis) {
            const key = `messages:${conversationId}`;
            const cached = await redis.lrange(key, 0, -1);

            if (cached.length > 0) {
                console.log("✔ Loaded messages from Redis cache");
                return res.json({
                    messages: cached.map((m) => JSON.parse(m)),
                });
            }
        }

        // 2️⃣ Load messages from Turso (libSQL)
        const result = await db.execute({
            sql: `
                SELECT 
                    id,
                    role,
                    content,
                    created_at AS timestamp
                FROM messages
                WHERE conversation_id = ?
                ORDER BY created_at ASC
            `,
            args: [conversationId],
        });

        const rows = result.rows;

        // 3️⃣ Warm Redis cache
        if (redis) {
            const key = `messages:${conversationId}`;
            await redis.del(key);

            for (const row of rows) {
                await redis.rpush(key, JSON.stringify(row));
            }

            // store only last 50 messages
            await redis.ltrim(key, -50, -1);

            console.log("✔ Redis cache updated for conversation:", conversationId);
        }

        return res.json({ messages: rows });
    } catch (error) {
        console.error("Failed to load messages:", error);
        return res.status(500).json({ error: "Failed to load messages" });
    }
};