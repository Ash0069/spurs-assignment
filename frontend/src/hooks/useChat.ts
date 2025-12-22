'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '@/services/chatApi';
import { Message, Chat } from '@/types/chat';

export const useChat = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 🔹 EFFECT 1: Load chat list on mount
     */
    useEffect(() => {
        chatApi
            .getChats()
            .then((data) => {
                setChats(data);
                if (data.length > 0) {
                    setActiveChat(data[0].conversationId);
                }
            })
            .catch((err) => {
                console.error('Failed to load chats:', err);
            });
    }, []);

    /**
     * 🔹 EFFECT 2: Load messages when active chat changes
     */
    useEffect(() => {
        if (!activeChat) return;

        // Prevent refetch if already loaded
        if (messages[activeChat]) return;

        chatApi
            .getMessages(activeChat)
            .then((data) => {
                setMessages((prev) => ({
                    ...prev,
                    [activeChat]: data,
                }));
            })
            .catch((err) => {
                console.error('Failed to load messages:', err);
            });
    }, [activeChat, messages]);

    /**
     * 🔹 Start new chat
     */
    const createNewChat = useCallback(() => {
        setActiveChat(null);
    }, []);

    /**
     * 🔹 Send message
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: Message = {
                id: Date.now(),
                role: 'user',
                content: content.trim(),
                timestamp: new Date().toISOString(),
            };

            const tempId = activeChat ?? 'new';

            // Optimistic UI
            setMessages((prev) => ({
                ...prev,
                [tempId]: [...(prev[tempId] || []), userMessage],
            }));

            setIsLoading(true);

            try {
                const response = await chatApi.sendMessage(
                    content.trim(),
                    activeChat ?? undefined
                );

                const { conversationId, message: aiMessage } = response;

                setMessages((prev) => ({
                    ...prev,
                    [conversationId]: [
                        ...(prev[tempId] || []),
                        aiMessage,
                    ],
                }));

                setChats((prev) => {
                    const exists = prev.find((c) => c.conversationId === conversationId);

                    if (exists) {
                        return prev.map((c) =>
                            c.conversationId === conversationId
                                ? {
                                    ...c,
                                    lastMessage: aiMessage.content,
                                    timestamp: aiMessage.timestamp,
                                }
                                : c
                        );
                    }

                    return [
                        {
                            id: conversationId,
                            conversationId,
                            title: 'Support Chat',
                            lastMessage: aiMessage.content,
                            timestamp: aiMessage.timestamp,
                        },
                        ...prev,
                    ];
                });

                setActiveChat(conversationId);
            } catch (err) {
                console.error('Failed to send message:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [activeChat, isLoading]
    );

    return {
        chats,
        activeChat,
        messages: activeChat ? messages[activeChat] || [] : [],
        isLoading,
        setActiveChat,
        createNewChat,
        sendMessage,
    };
};
