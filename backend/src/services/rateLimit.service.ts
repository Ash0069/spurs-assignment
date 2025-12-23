import { redis } from "../redis/redisClient.js";

export async function rateLimit(ip: string): Promise<boolean> {
    if (!redis) return false; // Redis disabled, skip limit

    const key = `rate-limit:${ip}`;
    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(key, 10); // 10-second window
    }

    return count > 5;
}