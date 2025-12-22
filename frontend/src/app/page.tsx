'use client';

import { MessageSquare, Plus } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';

export default function Home() {
  const {
    chats,
    activeChat,
    messages,
    isLoading,
    setActiveChat,
    createNewChat,
    sendMessage,
  } = useChat();

  const currentChat = activeChat
    ? chats.find((chat) => chat.id === activeChat)
    : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeChat === chat.id
                ? 'bg-blue-50 border-l-4 border-l-blue-600'
                : ''
                }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-gray-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {chat.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {chats.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {currentChat ? (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentChat.title}
            </h2>
            <p className="text-sm text-gray-500">
              Session ID: {currentChat.conversationId}
            </p>
          </div>
        ) : (
          <div className="bg-white border-b border-gray-200 px-6 py-4 text-sm text-gray-500">
            Start a new conversation
          </div>
        )}

        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}