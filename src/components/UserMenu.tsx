'use client';

import { useState, useRef, useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { User } from '@supabase/auth-helpers-nextjs';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = useSupabase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Get user information with provider-specific fallbacks
  const userMetadata = user.user_metadata;
  const provider = user.app_metadata?.provider || 'email';
  
  // Get avatar URL (both GitHub and Google store it as avatar_url)
  const userAvatar = userMetadata?.avatar_url || userMetadata?.picture;
  
  // Get user's name with provider-specific fallbacks
  const userName = 
    userMetadata?.name || // Works for both
    userMetadata?.full_name || // Google specific
    userMetadata?.user_name || // GitHub specific
    user.email?.split('@')[0] || // Email fallback
    'User';

  // Get user's initials
  const userInitial = 
    userMetadata?.name?.[0]?.toUpperCase() || // Try name first
    user.email?.[0]?.toUpperCase() || // Then email
    '?'; // Final fallback

  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={`${userName}'s avatar`}
            className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {userInitial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email || `${providerName} user`}
            </p>
          </div>
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            Signed in with {providerName}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 