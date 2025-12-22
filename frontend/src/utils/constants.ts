export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ENDPOINTS = {
    SEND_MESSAGE: '/api/chat/message',
    GET_CHATS: '/api/chat/list',
    CREATE_CHAT: '/api/chat/create',
    GET_MESSAGES: '/api/chat',
};