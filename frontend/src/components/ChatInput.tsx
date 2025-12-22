import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim() || disabled) return;
        onSend(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-300 bg-white p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="text-black flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}