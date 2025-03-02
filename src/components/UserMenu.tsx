'use client';

import { useState, useRef, useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

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

    // Only add the event listener when the menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Get user information with provider-specific fallbacks
  const userMetadata = user.user_metadata;
  
  // Check for GitHub-specific metadata
  const isGitHubUser = userMetadata?.avatar_url?.includes('github') || 
                      userMetadata?.html_url?.includes('github') ||
                      userMetadata?.login;

  // Check for Google-specific metadata
  const isGoogleUser = userMetadata?.picture?.includes('googleusercontent') ||
                      (userMetadata?.email_verified === true && !isGitHubUser);
  
  // Determine provider based on metadata first, then fall back to identities
  let provider = 'email';
  
  if (isGitHubUser) {
    provider = 'github';
  } else if (isGoogleUser) {
    provider = 'google';
  } else if (user.identities && user.identities.length > 0) {
    provider = user.identities[0].provider;
  } else if (user.app_metadata?.provider) {
    provider = user.app_metadata.provider;
  }
  
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

  // Format provider name for display
  const providerName = provider === 'github' ? 'GitHub' : 
                       provider === 'google' ? 'Google' : 
                       provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt=""
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-xs font-medium">
            {userInitial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-800">
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-xl font-medium">
                    {userInitial}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                {userName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {user.email || `${providerName} user`}
              </p>
            </div>
            
            <div className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
              signed in with {providerName}
            </div>
            
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center justify-center px-4 py-3 rounded-md",
                "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                "border border-gray-200 dark:border-gray-800",
                "transition-colors"
              )}
            >
              <span className="font-medium">sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 