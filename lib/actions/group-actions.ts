"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type MembershipRow = {
  group_id: string;
};

// add user to group by username
export async function addGroupMember(groupId: string, username: string, role: string = "member") {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "User not found." };
  }

  const { error } = await supabase
    .from("memberships")
    .insert({ group_id: groupId, user_id: profile.id, role })
  
    if (error){
      console.error("Error adding member:", error.message);
      return { error: error.message };
    }

    revalidatePath("/app/chat.tsx");
    return { success: true };
}

// remove user from a group by username
export async function removeGroupMember(groupId: string, username: string){
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "User not found." };
  }

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", profile.id);
    
  if (error){
    console.error("Error removing member:", error.message);
    return { error: error.message };
  }

  revalidatePath("/app/protected/chat.tsx");
  return { success: true };
}

export async function findOrCreateDirectConversationByUsername(
  targetUsername: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", targetUsername)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return { error: "Username was not found." };
  }

  const targetUserId = targetProfile.id;

  if (user.id === targetUserId) {
    return { error: "You cannot start a conversation with yourself." };
  }

  const { data: currentMemberships, error: currentMembershipsError } =
    await supabase
      .from("memberships")
      .select("group_id")
      .eq("user_id", user.id);

  if (currentMembershipsError) {
    return { error: currentMembershipsError.message };
  }

  const { data: targetMemberships, error: targetMembershipsError } =
    await supabase
      .from("memberships")
      .select("group_id")
      .eq("user_id", targetUserId);

  if (targetMembershipsError) {
    return { error: targetMembershipsError.message };
  }

  const currentGroupIds = new Set(
    ((currentMemberships ?? []) as MembershipRow[]).map(
      (membership) => membership.group_id,
    ),
  );
  const sharedConversation = ((targetMemberships ?? []) as MembershipRow[]).find(
    (membership) => currentGroupIds.has(membership.group_id),
  );

  if (sharedConversation) {
    return { conversationId: sharedConversation.group_id };
  }

  const { data: newGroup, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: "Direct Message",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (groupError || !newGroup) {
    return { error: groupError?.message ?? "Could not create conversation." };
  }

  const { error: membershipInsertError } = await supabase
    .from("memberships")
    .insert([
      { group_id: newGroup.id, user_id: user.id, role: "member" },
      { group_id: newGroup.id, user_id: targetUserId, role: "member" },
    ]);

  if (membershipInsertError) {
    return { error: membershipInsertError.message };
  }

  revalidatePath("/protected/chat");
  return { conversationId: newGroup.id };
}
