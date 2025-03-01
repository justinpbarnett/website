'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { cn } from '@/lib/utils';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">sign in</h2>
        <p className="text-gray-600 dark:text-gray-300">choose a provider to continue</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGithubLogin}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md",
            "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
            "border border-gray-200 dark:border-gray-800",
            "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
          <span className="font-medium">github</span>
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md",
            "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
            "border border-gray-200 dark:border-gray-800",
            "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545 12.151L12.545 7.851L22.154 7.851C22.256 8.375 22.323 8.963 22.323 9.618C22.323 11.889 21.723 13.944 20.523 15.445C19.323 16.947 17.522 17.697 15.121 17.697C12.721 17.697 10.62 16.697 9.119 14.697C7.618 12.697 6.867 10.297 6.867 7.497C6.867 4.697 7.618 2.297 9.119 0.297C10.62-1.703 12.721-2.703 15.121-2.703C17.621-2.703 19.722-1.803 21.222 0.097L18.022 3.297C17.222 2.197 16.222 1.647 15.021 1.647C13.821 1.647 12.821 2.147 12.021 3.147C11.221 4.147 10.821 5.597 10.821 7.497C10.821 9.397 11.221 10.847 12.021 11.847C12.821 12.847 13.821 13.347 15.021 13.347C15.921 13.347 16.721 13.147 17.421 12.747C18.121 12.347 18.621 11.847 18.921 11.247L12.545 11.247L12.545 7.851"
            />
          </svg>
          <span className="font-medium">google</span>
        </button>
      </div>

      {error && (
        <div className="mt-6 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
} 