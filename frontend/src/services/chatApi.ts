import { API_BASE_URL, ENDPOINTS } from '@/utils/constants';
import { Message, Chat, SendMessageResponse } from '@/types/chat';

export const chatApi = {
    async sendMessage(
        message: string,
        conversationId?: string
    ): Promise<SendMessageResponse> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SEND_MESSAGE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                conversationId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return response.json();
    },

    async getChats(): Promise<Chat[]> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_CHATS}`);

        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }

        const data = await response.json();

        return data.map((chat: any) => ({
            id: chat.conversationId,
            conversationId: chat.conversationId,
            title: 'Support Chat',
            lastMessage: chat.lastMessage ?? '',
            timestamp: chat.updatedAt,
        }));
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const response = await fetch(
            `${API_BASE_URL}${ENDPOINTS.GET_MESSAGES}/${conversationId}/messages`
        );

        if (!response.ok) {
            throw new Error("Failed to load messages");
        }

        const data = await response.json();
        return data.messages;
    },

    async createChat(): Promise<Chat> {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_CHAT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create chat');
        }

        const data = await response.json();
        return data.chat;
    },
};