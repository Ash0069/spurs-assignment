export default function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg">
                <p className="text-sm text-gray-500 italic">Agent is typing...</p>
            </div>
        </div>
    );
}