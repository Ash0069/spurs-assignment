import dotenv from 'dotenv';
dotenv.config();
import { redis } from "../redis/redisClient.js";

const SYSTEM_PROMPT =
  "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely.";

const MAX_HISTORY_MESSAGES = 10;
const MAX_OUTPUT_TOKENS = 300;

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
  console.warn("⚠️ MISTRAL_API_KEY is not set. AI responses will be disabled.");
}

export async function generateReply(
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  if (!MISTRAL_API_KEY) {
    return "⚠️ AI service is not configured. Please try again later.";
  }

  // ---------------------------------------------------------------------------
  // 1️⃣ Try Redis Cache
  // ---------------------------------------------------------------------------
  const cacheKey = `llm:${userMessage}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✔ LLM reply served from Redis cache");
      return JSON.parse(cached);
    }
  }
  // ---------------------------------------------------------------------------


  try {
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage }
    ];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages,
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Mistral API error:", response.status, errorData);
      return "⚠️ I'm having trouble responding right now. Please try again shortly.";
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ??
      "⚠️ I couldn't generate a response.";

    // ---------------------------------------------------------------------------
    // 2️⃣ STORE the reply in Redis cache (30 minutes)
    // ---------------------------------------------------------------------------
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(reply), "EX", 1800);
      console.log("✔ LLM reply cached in Redis");
    }
    // ---------------------------------------------------------------------------

    return reply;

  } catch (error: unknown) {
    console.error("Mistral API error:", error);
    return "⚠️ Something went wrong while contacting the AI. Please try again later.";
  }
}