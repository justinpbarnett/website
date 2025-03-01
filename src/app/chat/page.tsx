'use client';

import { useChat } from 'ai/react';
import { LoadingDots } from '@/components/LoadingDots';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ChatPage() {
  const [error, setError] = useState<string | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (err) => {
      setError(err.message);
      console.error('Chat error:', err);
    }
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await handleSubmit(e);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex w-full items-start gap-4 p-4 rounded-lg',
              m.role === 'assistant' ? 'bg-muted' : 'bg-background'
            )}
          >
            <span className="font-semibold w-14">
              {m.role === 'assistant' ? 'AI' : 'You'}:
            </span>
            <div className="flex-1 space-y-2 whitespace-pre-wrap">
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full items-start gap-4 p-4 rounded-lg bg-muted">
            <span className="font-semibold w-14">AI:</span>
            <div className="flex-1">
              <LoadingDots className="text-2xl" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex w-full items-start gap-4 p-4 rounded-lg bg-destructive/10 text-destructive">
            <span className="font-semibold">Error:</span>
            <div className="flex-1">{error}</div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything about Justin..."
          className="flex-1 p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors",
            (isLoading || !input.trim()) 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-blue-700"
          )}
        >
          Send
        </button>
      </form>
    </div>
  );
} 