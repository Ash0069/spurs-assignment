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
    const createNewChat = useCallback(async () => {
        try {
            const { conversationId } = await chatApi.createChat();

            const newChat: Chat = {
                id: conversationId,
                conversationId,
                title: "New Chat",
                lastMessage: "",
                timestamp: new Date().toISOString(),
            };

            setChats((prev) => [newChat, ...prev]);
            setMessages((prev) => ({ ...prev, [conversationId]: [] }));
            setActiveChat(conversationId);
        } catch (err) {
            console.error("Failed to create chat:", err);
        }
    }, []);

    /**
     * 🔹 Send message
     */
    const sendChatMessageHook = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: Message = {
                id: Date.now(),
                role: "user",
                content,
                timestamp: new Date().toISOString(),
            };

            const tempId = activeChat ?? "new";

            // 1️⃣ Optimistic user message
            setMessages((prev) => ({
                ...prev,
                [tempId]: [...(prev[tempId] || []), userMessage],
            }));

            setIsLoading(true);

            try {
                // 2️⃣ Call backend (THIS triggers LLM)
                const response = await chatApi.sendMessage(content, activeChat ?? undefined);

                const { conversationId, message: aiMessage } = response;

                // 3️⃣ Store AI reply
                setMessages((prev) => ({
                    ...prev,
                    [conversationId]: [
                        ...(prev[tempId] || []),
                        aiMessage,
                    ],
                }));

                // 4️⃣ Update chat list
                setChats((prev) => {
                    const exists = prev.find((c) => c.id === conversationId);

                    if (exists) {
                        return prev.map((c) =>
                            c.id === conversationId
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
                            title: "Support Chat",
                            lastMessage: aiMessage.content,
                            timestamp: aiMessage.timestamp,
                        },
                        ...prev,
                    ];
                });

                setActiveChat(conversationId);
            } catch (err) {
                console.error("Send message failed:", err);
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
        sendMessage: sendChatMessageHook,
    };
};
