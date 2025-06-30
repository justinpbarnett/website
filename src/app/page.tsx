"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { LoadingDots } from "@/components/LoadingDots";
import { cn } from "@/lib/utils";
import Login from "@/components/Login";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import ModelSelector from "@/components/ModelSelector";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { FormEvent } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { Message } from "ai";

const initialSuggestions = [
  "Where did you go to school?",
  "What do you do for fun?",
  "Tell me about your family.",
  "What's your fav tech stack?",
  "How'd you get into VR?",
  "What's Search & Rescue like?",
  "Tell me about your YouTube channel.",
  "How do you balance work and family?",
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedSuggestions] = useState(new Set<string>());
  const [currentSuggestions, setCurrentSuggestions] = useState(
    initialSuggestions.slice(0, 3)
  );
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [canceledMessageIds, setCanceledMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [chatId, setChatId] = useState<string>("persistent-chat");
  const [selectedModel, setSelectedModel] =
    useState<string>("openai:gpt-4o-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const clearConfirmRef = useRef<HTMLDivElement>(null);
  const supabase = useSupabase();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    append,
    stop,
    reload,
  } = useChat({
    api: "/api/chat",
    onError: (err: Error) => {
      // Set a more user-friendly error message
      let errorMessage = err.message;

      // Check for common error patterns and provide more helpful messages
      if (errorMessage.includes("API key")) {
        errorMessage = "API key error. Please check the server configuration.";
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("quota")
      ) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
      } else if (
        errorMessage.includes("not available") ||
        errorMessage.includes("invalid model")
      ) {
        errorMessage = `The selected model is currently unavailable. Please try a different model.`;
      } else if (errorMessage.includes("Authentication required")) {
        errorMessage = `This model requires you to log in. Please log in to use premium models.`;
      } else if (errorMessage === "An error occurred.") {
        // Generic error from AI SDK - provide more context
        errorMessage = `Error communicating with the selected model. Please try a different model or try again later.`;
      }

      setError(errorMessage);
      console.error("Chat error:", err);
    },
    id: chatId,
    initialMessages:
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("chatMessages") || "[]")
        : [],
    onFinish: (message: Message) => {
      if (typeof window !== "undefined") {
        const updatedMessages = [...messages, message];
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      }
    },
    body: {
      model: selectedModel,
      isAuthenticated: !!user,
    },
    experimental_throttle: 50,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

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

  // Add keyboard detection
  useEffect(() => {
    const initialHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      setIsKeyboardOpen(currentHeight < initialHeight * 0.8);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () =>
      window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  const rotateSuggestions = () => {
    const unusedSuggestions = initialSuggestions.filter(
      (s) => !usedSuggestions.has(s)
    );
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

    // Clear any previous errors
    setError(null);

    usedSuggestions.add(suggestion);
    rotateSuggestions();

    try {
      await append(
        {
          content: suggestion,
          role: "user",
        } as Message,
        {
          body: {
            model: selectedModel,
            isAuthenticated: !!user,
          },
        }
      );
    } catch (err) {
      console.error("Failed to send suggestion:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send suggestion"
      );
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent submission if already loading
    if (isLoading) return;

    // Clear any previous errors
    setError(null);

    // Only proceed if there's actual input text
    if (!input.trim()) return;

    try {
      await handleSubmit(e, {
        body: {
          model: selectedModel,
          isAuthenticated: !!user,
        },
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleStopGeneration = () => {
    // Mark the last message as canceled
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id) {
        setCanceledMessageIds((prev) => {
          const updated = new Set(prev);
          updated.add(lastMessage.id as string);
          return updated;
        });
      }
    }
    stop();
    setError(null);
  };

  // Scroll to bottom when messages change or while loading
  useEffect(() => {
    if (!userHasScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, userHasScrolled]);

  // Handle scroll events to detect manual user scrolling
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Check if user is at the bottom of the chat
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      if (!isAtBottom) {
        setUserHasScrolled(true);
      } else {
        setUserHasScrolled(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Force scroll to bottom on initial load
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      setUserHasScrolled(false);
    }
  }, []);

  // Add a function to clear chat history
  const clearChatHistory = () => {
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatMessages");
    }

    // Reset canceled message IDs
    setCanceledMessageIds(new Set());

    // Clear error state
    setError(null);

    // Generate a new chat ID to force a reset of the chat
    const newChatId = `chat-${Date.now()}`;
    setChatId(newChatId);

    // Force reload the page to ensure everything is reset
    window.location.reload();

    // Hide the confirmation dialog
    setShowClearConfirm(false);
  };

  // Add a function to handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    // Clear error when model changes
    setError(null);
  };

  // Check if the current model is expensive and reset to a free model if user is not logged in
  useEffect(() => {
    const [provider, modelName] = selectedModel.split(":");

    // Define expensive models (same as in the API route)
    const isExpensiveModel =
      // OpenAI expensive models
      (provider === "openai" &&
        [
          "gpt-4o",
          "gpt-4-turbo",
          "gpt-4",
          "o1",
          "o1-mini",
          "o1-preview",
          "o3-mini",
        ].includes(modelName)) ||
      // Anthropic expensive models
      (provider === "anthropic" &&
        [
          "claude-sonnet-4-latest",
          "claude-3-7-sonnet-latest",
          "claude-3-5-sonnet-latest",
          "claude-3-opus-latest",
          "claude-3-sonnet-latest",
        ].includes(modelName)) ||
      // Google expensive models
      (provider === "google" &&
        ["gemini-2.0-flash-001", "gemini-1.5-pro-latest"].includes(
          modelName
        )) ||
      // Grok models
      provider === "grok";

    // If the model is expensive and user is not logged in, reset to a free model
    if (isExpensiveModel && !user) {
      setSelectedModel("openai:gpt-4o-mini");
      console.log(
        "Reset to free model because the selected model requires login"
      );
    }
  }, [selectedModel, user]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close mobile menu when clicking outside
      if (
        showMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }

      // Close login modal when clicking outside
      if (
        showLogin &&
        loginModalRef.current &&
        !loginModalRef.current.contains(event.target as Node)
      ) {
        setShowLogin(false);
      }

      // Close clear confirmation when clicking outside
      if (
        showClearConfirm &&
        clearConfirmRef.current &&
        !clearConfirmRef.current.contains(event.target as Node)
      ) {
        setShowClearConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileMenu, showLogin, showClearConfirm]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-5xl mx-auto w-full px-8 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Mobile menu button and desktop resume links */}
            <div className="flex items-center">
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

              {/* Desktop resume links */}
              <div className="hidden md:flex gap-4 ml-2">
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
            </div>

            {/* Center: Split button (desktop only) */}
            <div className="hidden md:flex">
              <div className="w-36 border-r-0 rounded-r-none">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                  disabled={isLoading}
                  isLoggedIn={!!user}
                />
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className={cn(
                  "px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md rounded-l-none border-l-0",
                  messages.length > 0
                    ? "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                    : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                )}
                disabled={messages.length === 0 || isLoading}
              >
                Clear
              </button>
            </div>

            {/* Right side: Theme toggle and user menu/login */}
            <div className="flex gap-4 items-center">
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
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-black border-t dark:border-gray-800"
          >
            <div className="max-w-5xl mx-auto w-full px-8 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
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

                {/* Split button for model selector and clear chat */}
                <div className="flex mt-2">
                  <div className="w-48 border-r-0 rounded-r-none">
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={handleModelChange}
                      disabled={isLoading}
                      isLoggedIn={!!user}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowClearConfirm(true);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md rounded-l-none border-l-0",
                      messages.length > 0
                        ? "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                        : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    )}
                    disabled={messages.length === 0 || isLoading}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title and subtitle section - hidden when keyboard is open on mobile */}
      <header
        className={cn(
          "fixed z-20",
          // Position at 1/3 of screen height on desktop instead of center
          "md:flex md:items-start md:h-screen md:w-full md:pt-[33vh]",
          // On mobile, position at top
          "left-0 right-0 top-0 pt-24",
          // Hide when keyboard is open and input is focused on mobile
          isKeyboardOpen && inputFocused && "hidden",
          // Make sure it doesn't interfere with scrolling
          "pointer-events-none"
        )}
      >
        <div className="max-w-5xl mx-auto w-full px-8 py-4 md:py-0">
          <div className="text-left pointer-events-auto relative z-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Justin P Barnett
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              I'm a full-stack developer
              <br />
              specializing in AI, VR, and web dev.
            </p>
          </div>
        </div>
      </header>

      {/* Login modal */}
      {showLogin && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={loginModalRef}
            className="relative bg-white dark:bg-black rounded-lg w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-lg"
          >
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

      {/* Main chat area */}
      <main className="flex-1 relative h-screen">
        {/* Chat container - this is the scrollable area */}
        <div
          ref={chatContainerRef}
          className="fixed inset-x-0 top-0 bottom-24 overflow-y-auto z-0"
          style={{ touchAction: "pan-y" }}
        >
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 pb-4">
            {/* Add extra padding at the top to allow scrolling past the gradient */}
            <div className="h-[50vh]" />

            {/* Messages container */}
            <div className="space-y-6">
              {messages.map((message: Message, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col space-y-2 overflow-x-auto relative pl-4",
                    message.role === "assistant" ? "items-start" : "items-end"
                  )}
                >
                  <span className="absolute left-0 top-2 text-gray-400 dark:text-gray-600 font-mono">
                    &gt;
                  </span>
                  <ReactMarkdown
                    className={cn(
                      "prose dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 w-full",
                      "prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-semibold",
                      "prose-li:text-gray-700 dark:prose-li:text-gray-300",
                      "prose-hr:border-gray-200 dark:prose-hr:border-gray-800",
                      "prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700",
                      "prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-th:p-2 prose-td:p-2",
                      message.role === "assistant"
                        ? "prose-p:text-gray-900 dark:prose-p:text-gray-100"
                        : "prose-p:text-gray-600 dark:prose-p:text-gray-400"
                    )}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(
                        props: ComponentPropsWithoutRef<"code"> & {
                          inline?: boolean;
                        }
                      ) {
                        const { inline, className, children } = props;
                        return (
                          <code
                            className={cn(
                              "bg-gray-100 dark:bg-gray-800 rounded px-1",
                              inline ? "py-0.5" : "block p-2 overflow-x-auto",
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
                              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors",
                              className
                            )}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                      ul({ node, className, children, ...props }) {
                        return (
                          <ul
                            className={cn("pl-6 list-disc my-4", className)}
                            {...props}
                          >
                            {children}
                          </ul>
                        );
                      },
                      ol({ node, className, children, ...props }) {
                        return (
                          <ol
                            className={cn("pl-6 list-decimal my-4", className)}
                            {...props}
                          >
                            {children}
                          </ol>
                        );
                      },
                      blockquote({ node, className, children, ...props }) {
                        return (
                          <blockquote
                            className={cn(
                              "pl-4 border-l-2 italic my-4",
                              className
                            )}
                            {...props}
                          >
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.id && canceledMessageIds.has(message.id) && (
                    <div className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
                      Message was stopped early
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2">
                  <LoadingDots />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Gradient overlay that covers the chat content */}
        <div
          className={cn(
            "fixed inset-x-0 h-3/4 top-0 z-10 pointer-events-none",
            "bg-gradient-to-b from-white/95 from-0% via-white/90 via-30% to-transparent to-100% dark:from-black/95 dark:via-black/95 dark:to-transparent",
            // Hide when keyboard is open and input is focused on mobile
            isKeyboardOpen && inputFocused && "hidden"
          )}
        />

        {/* Input area fixed to bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-4">
            <form onSubmit={onSubmit} className="flex flex-col space-y-4">
              {/* Chat suggestions - only show on desktop */}
              <div
                className={cn(
                  "flex flex-wrap gap-2",
                  "hidden md:flex" // Only show on desktop, hide on mobile
                )}
              >
                {currentSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors border border-gray-200 dark:border-gray-800 rounded-full"
                    // Prevent these buttons from submitting the form when clicked
                    type="button"
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
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask me anything..."
                  className="flex-1 p-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-md px-4 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 text-gray-900 dark:text-gray-100"
                />
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-gray-200 dark:border-gray-800 rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 015.25 16.5v-9z"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                )}
              </div>
            </form>

            {error && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clear chat confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={clearConfirmRef}
            className="relative bg-white dark:bg-black rounded-lg w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Clear chat history?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will delete all messages in this conversation. This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearChatHistory}
                className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
