import { SupabaseClient } from "@supabase/supabase-js";

export async function searchUsers(supabase: SupabaseClient, currentUserId: string, searchTerm: string) {
  if (!searchTerm.trim()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    // Find usernames that contain the search term (case-insensitive)
    .ilike('username', `%${searchTerm}%`)
    // Exclude the current user from the search results
    .neq('id', currentUserId)
    .limit(10); // Prevent massive payloads

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }
  return data;
}

// Send the friend request
export async function sendFriendRequest(supabase: SupabaseClient, currentUserId: string, targetUserId: string) {
  const { error } = await supabase
    .from('friendships')
    .insert({
      user_a_id: currentUserId,
      user_b_id: targetUserId,
      status: 'pending'
    });

  if (error) {
    // this will catch attempts to send duplicate requests.
    if (error.code === '23505') { 
      return { success: false, message: "A request already exists with this user." };
    }
    console.error("Error sending request:", error);
    return { success: false, message: "Failed to send request." };
  }

  return { success: true, message: "Friend request sent!" };
}