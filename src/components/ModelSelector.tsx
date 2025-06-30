"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModelOption {
  provider: string;
  model: string;
  displayName: string;
  shortName: string;
  expensive?: boolean;
}

const modelOptions: ModelOption[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    displayName: "OpenAI GPT-4o",
    shortName: "GPT-4o",
    expensive: true,
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    displayName: "OpenAI GPT-4o Mini",
    shortName: "GPT-4o Mini",
  },
  {
    provider: "openai",
    model: "gpt-4-turbo",
    displayName: "OpenAI GPT-4 Turbo",
    shortName: "GPT-4 Turbo",
    expensive: true,
  },
  {
    provider: "openai",
    model: "gpt-4",
    displayName: "OpenAI GPT-4",
    shortName: "GPT-4",
    expensive: true,
  },
  {
    provider: "openai",
    model: "gpt-3.5-turbo",
    displayName: "OpenAI GPT-3.5 Turbo",
    shortName: "GPT-3.5",
  },
  {
    provider: "openai",
    model: "o1",
    displayName: "OpenAI o1",
    shortName: "o1",
    expensive: true,
  },
  {
    provider: "openai",
    model: "o1-mini",
    displayName: "OpenAI o1 Mini",
    shortName: "o1 Mini",
    expensive: true,
  },
  {
    provider: "openai",
    model: "o1-preview",
    displayName: "OpenAI o1 Preview",
    shortName: "o1 Preview",
    expensive: true,
  },
  {
    provider: "openai",
    model: "o3-mini",
    displayName: "OpenAI o3 Mini",
    shortName: "o3 Mini",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    displayName: "Claude Sonnet 4",
    shortName: "Claude 4",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-7-sonnet-latest",
    displayName: "Claude 3.7 Sonnet",
    shortName: "Claude 3.7",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    shortName: "Claude 3.5",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    displayName: "Claude 3.5 Haiku",
    shortName: "Claude 3.5 Haiku",
  },
  {
    provider: "anthropic",
    model: "claude-3-opus-latest",
    displayName: "Claude 3 Opus",
    shortName: "Claude 3 Opus",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-sonnet-latest",
    displayName: "Claude 3 Sonnet",
    shortName: "Claude 3 Sonnet",
    expensive: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-haiku-latest",
    displayName: "Claude 3 Haiku",
    shortName: "Claude 3 Haiku",
  },
  {
    provider: "google",
    model: "gemini-2.0-flash-001",
    displayName: "Google Gemini 2.0 Flash",
    shortName: "Gemini 2.0",
    expensive: true,
  },
  {
    provider: "google",
    model: "gemini-1.5-pro-latest",
    displayName: "Google Gemini 1.5 Pro",
    shortName: "Gemini 1.5 Pro",
    expensive: true,
  },
  {
    provider: "google",
    model: "gemini-1.5-flash-latest",
    displayName: "Google Gemini 1.5 Flash",
    shortName: "Gemini 1.5 Flash",
  },
  {
    provider: "google",
    model: "gemini-1.5-flash-8b-latest",
    displayName: "Google Gemini 1.5 Flash 8B",
    shortName: "Gemini 1.5 8B",
  },
  {
    provider: "grok",
    model: "grok-2-1212",
    displayName: "Grok 2",
    shortName: "Grok 2",
    expensive: true,
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  isLoggedIn = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDisplayName, setSelectedDisplayName] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Find the display name for the currently selected model
  useEffect(() => {
    const [provider, model] = selectedModel.split(":");
    const option = modelOptions.find(
      (opt) => opt.provider === provider && opt.model === model
    );
    setSelectedDisplayName(option?.shortName || "Select Model");
  }, [selectedModel]);

  const handleSelectModel = (option: ModelOption) => {
    // If the model is expensive and user is not logged in, show login prompt
    if (option.expensive && !isLoggedIn) {
      setShowLoginPrompt(true);
      // Hide the prompt after 3 seconds
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    onModelChange(`${option.provider}:${option.model}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the document click handler from firing
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-3 py-1.5 text-sm rounded-md rounded-r-none",
          "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
          "border border-gray-200 dark:border-gray-800 transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="truncate">{selectedDisplayName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "h-4 w-4 ml-1 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Login prompt notification */}
      {showLoginPrompt && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 text-xs text-yellow-800 dark:text-yellow-200 z-50 shadow-md">
          Please log in to use premium models
        </div>
      )}

      {isOpen && (
        <div
          className="absolute z-50 w-56 mt-1 right-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
        >
          <ul className="py-1">
            {modelOptions.map((option) => {
              const isExpensiveAndLocked = option.expensive && !isLoggedIn;

              return (
                <li key={`${option.provider}:${option.model}`}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      selectedModel === `${option.provider}:${option.model}`
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300",
                      isExpensiveAndLocked && "opacity-70"
                    )}
                    onClick={() => handleSelectModel(option)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.shortName}</span>
                      {isExpensiveAndLocked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 dark:text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>{option.provider}</span>
                      {isExpensiveAndLocked && (
                        <span className="text-xs italic">Login required</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
