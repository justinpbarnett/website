'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { LoadingDots } from '@/components/LoadingDots';
import { cn } from '@/lib/utils';
import Login from '@/components/Login';
import UserMenu from '@/components/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { User } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { FormEvent } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

const initialSuggestions = [
  "Where did you go to school?",
  "Tell me about your most recent projects.",
  "What technologies do you specialize in?",
  "What's your favorite programming language?",
  "How did you get into programming?",
  "What's your development philosophy?",
  "Tell me about a challenging project.",
  "What's your preferred tech stack?",
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedSuggestions] = useState(new Set<string>());
  const [currentSuggestions, setCurrentSuggestions] = useState(initialSuggestions.slice(0, 3));
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const supabase = useSupabase();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: '/api/chat',
    onError: (err) => {
      setError(err.message);
      console.error('Chat error:', err);
    }
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const rotateSuggestions = () => {
    const unusedSuggestions = initialSuggestions.filter(s => !usedSuggestions.has(s));
    if (unusedSuggestions.length === 0) {
      // If all suggestions have been used, reset and start over
      usedSuggestions.clear();
      setCurrentSuggestions(initialSuggestions.slice(0, 3));
    } else {
      // Show up to 3 unused suggestions
      setCurrentSuggestions(unusedSuggestions.slice(0, 3));
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    
    usedSuggestions.add(suggestion);
    rotateSuggestions();
    
    try {
      await append({
        content: suggestion,
        role: 'user',
      });
    } catch (err) {
      console.error('Failed to send suggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to send suggestion');
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    try {
      await handleSubmit(e);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  // Scroll to bottom when messages change or while loading
  useEffect(() => {
    if (!userHasScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, userHasScrolled]);

  // Handle scroll events to detect manual user scrolling
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      
      if (!isAtBottom) {
        setUserHasScrolled(true);
      } else {
        setUserHasScrolled(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-5xl mx-auto w-full px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Desktop resume link */}
            <div className="hidden md:flex gap-4">
              <a
                href="/resume"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                résumé
              </a>
              <a
                href="/projects"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                projects
              </a>
            </div>

            <div className="flex gap-2 items-center">
              {/* Desktop menu */}
              <div className="hidden md:flex gap-2 items-center">
                <ThemeToggle />
                {user ? (
                  <UserMenu user={user} />
                ) : (
                  <button
                    onClick={() => setShowLogin(!showLogin)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                  >
                    login
                  </button>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-black border-t dark:border-gray-800">
            <div className="max-w-5xl mx-auto w-full px-8 py-4 flex flex-col gap-4">
              <a
                href="/resume"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                résumé
              </a>
              <a
                href="/projects"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                projects
              </a>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">theme</span>
                <ThemeToggle />
              </div>
              {!user && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowLogin(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  login
                </button>
              )}
              {user && (
                <div className="border-t dark:border-gray-800 pt-4">
                  <UserMenu user={user} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <header className="fixed top-0 left-0 right-0 z-10 pt-16 md:pt-0">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/95 from-0% via-white/95 via-45% to-transparent to-50% dark:from-black/95 dark:from-0% dark:via-black/95 dark:via-45% dark:to-transparent dark:to-50% h-[100vh]" />
        <div className="w-full py-8 md:py-[30vh] relative z-10 pointer-events-auto">
          <div className="max-w-5xl mx-auto w-full px-8">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Justin P Barnett
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                I'm a full-stack developer<br />
                specializing in AI, VR, and web dev.
              </p>
            </div>
          </div>
        </div>
      </header>

      {showLogin && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
            <Login />
          </div>
        </div>
      )}

      <main className="flex-1 relative">
        <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-4 md:px-8">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-6 pt-4 pb-32"
          >
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col space-y-2 overflow-x-auto',
                  message.role === 'assistant' ? 'items-start' : 'items-end'
                )}
              >
                <ReactMarkdown
                  className={cn(
                    'prose dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 w-full',
                    message.role === 'assistant' ? 'prose-p:text-gray-900 dark:prose-p:text-gray-100' : 'prose-p:text-gray-600 dark:prose-p:text-gray-400'
                  )}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
                      const { inline, className, children } = props;
                      return (
                        <code
                          className={cn(
                            'bg-gray-100 dark:bg-gray-800 rounded px-1',
                            inline ? 'py-0.5' : 'block p-2',
                            className
                          )}
                        >
                          {children}
                        </code>
                      );
                    },
                    a({ node, className, children, ...props }) {
                      return (
                        <a
                          className={cn(
                            'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
                            className
                          )}
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2">
                <LoadingDots />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-white dark:to-black pt-24 pb-8">
            <div className="max-w-5xl mx-auto w-full px-4 md:px-8">
              <form onSubmit={onSubmit} className="flex flex-col space-y-4">
                {/* Chat suggestions - hidden on mobile */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {currentSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors border-b border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me anything..."
                    className="flex-1 p-2 bg-transparent border-b border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    send
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
