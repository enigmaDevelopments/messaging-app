/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchUsers, sendFriendRequest } from '@/lib/actions/friend-request';

interface SearchResult {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export default function AddFriendSearch({ currentUserId }: { currentUserId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const supabase = createClient();

  const handleSearch = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSearching(true);
    setFeedbackMsg('');
    
    const users = await searchUsers(supabase, currentUserId, searchTerm);
    setResults(users);
    
    if (users.length === 0) {
      setFeedbackMsg('No users found.');
    }
    
    setIsSearching(false);
  };

  const handleSendRequest = async (targetUserId: string) => {
    const result = await sendFriendRequest(supabase, currentUserId, targetUserId);
    setFeedbackMsg(result.message);
    
    // Optional: Remove the user from the list once requested
    if (result.success) {
      setResults(results.filter(user => user.id !== targetUserId));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white dark:bg-transparent rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Find Friends</h2>
      
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          className="flex-1 px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button 
          type="submit" 
          disabled={isSearching || !searchTerm.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* feedback message */}
      {feedbackMsg && (
        <div className="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {feedbackMsg}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3 mt-4">
        {results.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* backup avatar dark mode: deeper blue background */}
              <div className="relative w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/50 overflow-hidden text-blue-700 dark:text-blue-400 font-bold">
                <span>{user.username?.charAt(0).toUpperCase() ?? '?'}</span>
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {user.username ?? 'Unknown User'}
              </span>
            </div>
            
            {/* Add Button dark mode */}
            <button
              onClick={() => handleSendRequest(user.id)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-600"
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );

}