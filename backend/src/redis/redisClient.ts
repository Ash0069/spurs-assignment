import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.warn("⚠️ REDIS_URL not set. Redis cache disabled.");
}

export const redis = redisUrl
    ? new Redis(redisUrl)
    : null;