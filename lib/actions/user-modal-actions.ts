"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserModalData } from "@/types/user-modal";

function normalizePair(a: string, b: string) {
  return a < b
    ? { userAId: a, userBId: b }
    : { userAId: b, userBId: a };
}

function normalizeStatus(
  status: string | null | undefined,
): "online" | "away" | "offline" {
  if (status === "online" || status === "away" || status === "offline") {
    return status;
  }

  return "offline";
}

export async function getUserModalData(
  targetUserId: string,
): Promise<{ data?: UserModalData; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, timezone, region, bio, status")
    .eq("id", targetUserId)
    .single();

  if (profileError || !profile) {
    return { error: "Could not load user profile." };
  }

  const isSelf = user.id === targetUserId;
  let areFriends = false;

  if (!isSelf) {
    const { userAId, userBId } = normalizePair(user.id, targetUserId);

    const { data: friendshipRows, error: friendshipError } = await supabase
      .from("friendships")
      .select("id")
      .eq("user_a_id", userAId)
      .eq("user_b_id", userBId)
      .limit(1);

    if (friendshipError) {
      return { error: "Could not load friendship status." };
    }

    areFriends = (friendshipRows?.length ?? 0) > 0;
  }

  let privateNote: string | null = null;

  if (!isSelf) {
    const { data: noteRow, error: noteError } = await supabase
      .from("user_profile_notes")
      .select("note")
      .eq("owner_id", user.id)
      .eq("target_user_id", targetUserId)
      .maybeSingle();

    if (noteError) {
      return { error: "Could not load private note." };
    }

    privateNote = noteRow?.note ?? "";
  }

  return {
    data: {
      id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      timezone: profile.timezone,
      region: profile.region,
      bio: profile.bio,
      status: normalizeStatus(profile.status),
      privateNote,
      areFriends,
      isSelf,
    },
  };
}

export async function addFriend(
  targetUserId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot add yourself." };
  }

  const { userAId, userBId } = normalizePair(user.id, targetUserId);

  const { error } = await supabase.from("friendships").insert({
    user_a_id: userAId,
    user_b_id: userBId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }

    return { error: error.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}

export async function removeFriend(
  targetUserId: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot remove yourself." };
  }

  const { userAId, userBId } = normalizePair(user.id, targetUserId);

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}

export async function savePrivateNote(
  targetUserId: string,
  note: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot create a private note for yourself here." };
  }

  const { error } = await supabase.from("user_profile_notes").upsert(
    {
      owner_id: user.id,
      target_user_id: targetUserId,
      note,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "owner_id,target_user_id",
    },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}