import { SupabaseClient } from "@supabase/supabase-js";


export async function fetchUserDMs(supabase: SupabaseClient, currentUserId: string) {
  // find DMs where the current user has a membership.
  const { data, error } = await supabase
    .from('groups')
    .select(`
      id,
      is_dm,
      memberships!inner(user_id),
      participants:memberships(
        user_id,
        profiles (
          id,
          username,
          avatar_url,
          status
        )
      )
    `)
    .eq('is_dm', true)
    .eq('memberships.user_id', currentUserId);

  if (error) {
    console.error("Error fetching DMs:", error.message || JSON.stringify(error));
    return [];
  }

  // Format the data to find the "other" person's profile for the UI
  const formattedDMs = data.map((group) => {
    // Find the participant that is NOT the current user
    const otherParticipant = group.participants.find(
      (p) => p.user_id !== currentUserId
    );

    return {
      conversationId: group.id,
      // Pass up the profile of the other user so the UI can render it
      otherUser: otherParticipant?.profiles || null, 
    };
  });

  return formattedDMs;
}