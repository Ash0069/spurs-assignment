import { Message } from '@/types/chat';

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xl px-4 py-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );
}