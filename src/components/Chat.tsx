import { useState } from 'react';

interface Message {
  user: string;
  ai: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export default function Chat({ messages, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="h-[400px] overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-start mb-2">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg py-2 px-4 max-w-[80%]">
                <p className="text-sm text-gray-900 dark:text-gray-100">{msg.user}</p>
              </div>
            </div>
            <div className="flex items-start justify-end">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg py-2 px-4 max-w-[80%]">
                <p className="text-sm text-gray-900 dark:text-gray-100" 
                   dangerouslySetInnerHTML={{ __html: msg.ai }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Type your message..."
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
} 