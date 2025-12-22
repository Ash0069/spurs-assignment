export type Role = "user" | "assistant";

export interface ChatRequest {
    conversationId?: string;
    message: string;
}

export interface ChatResponse {
    conversationId: string;
    reply: string;
}