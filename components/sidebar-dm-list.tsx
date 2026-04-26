/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserDMs } from '@/lib/actions/fetch-dm';

interface DMConversation {
  conversationId: string;
  otherUser: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    status: string | null;
  } | null;
}

export default function SidebarDMList({ currentUserId }: { currentUserId: string | null }) {
  const [dms, setDms] = useState<DMConversation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadDMs() {
      if (!currentUserId) return;
      
      const dmData = await fetchUserDMs(supabase, currentUserId);
      setDms(dmData as unknown as DMConversation[]);
    }
    
    loadDMs();
  }, [currentUserId, supabase]);

  return (
    <div className="flex flex-col w-full px-2 py-4 space-y-2">
      <h3 className="px-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Direct Messages
      </h3>
      
      <div className="flex flex-col space-y-1">
        {dms.map(({ conversationId, otherUser }) => {
          if (!otherUser) return null;

          return (
            <button 
              key={conversationId}
              className="flex items-center w-full px-2 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {/* avatar container aligned left */}
              <div className="relative flex-shrink-0">
                <img 
                  src={otherUser.avatar_url || '/default-avatar.png'} 
                  alt={otherUser.username ?? 'User avatar'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                {/* Status indicator  (maybe remove depending on result)*/}
                <div 
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    otherUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>

              {/* Username alongside the avatar */}
              <div className="ml-3 flex-1 text-left">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {otherUser.username}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}