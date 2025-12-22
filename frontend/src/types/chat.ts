export interface Message {
    id: number;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export interface Chat {
    id: string;               // same as conversationId (UI-friendly)
    conversationId: string;   // backend ID
    title: string;
    lastMessage: string;
    timestamp: string;
}

export interface SendMessageRequest {
    conversationId?: string;  // optional → new chat
    message: string;
}

export interface SendMessageResponse {
    conversationId: string;
    message: Message;
}