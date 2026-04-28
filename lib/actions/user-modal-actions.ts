"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserModalData } from "@/types/user-modal";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

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

function validateTimezone(timezone: string | null) {
  if (!timezone) return true;

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timezone }).format(
      new Date(),
    );
    return true;
  } catch {
    return false;
  }
}

async function getBlockState(
  supabase: SupabaseClient,
  currentUserId: string,
  targetUserId: string,
): Promise<{
  blockedByMe?: boolean;
  blockedMe?: boolean;
  error?: string;
}> {
  const { data: blockRows, error } = await supabase
    .from("blocked_users")
    .select("blocker_id, blocked_id")
    .in("blocker_id", [currentUserId, targetUserId])
    .in("blocked_id", [currentUserId, targetUserId]);

  if (error) {
    return { error: error.message };
  }

  const blockedByMe =
    blockRows?.some(
      (row) =>
        row.blocker_id === currentUserId && row.blocked_id === targetUserId,
    ) ?? false;

  const blockedMe =
    blockRows?.some(
      (row) =>
        row.blocker_id === targetUserId && row.blocked_id === currentUserId,
    ) ?? false;

  return {
    blockedByMe,
    blockedMe,
  };
}

async function setFriendshipStatus(
  supabase: SupabaseClient,
  currentUserId: string,
  targetUserId: string,
): Promise<{ success?: true; error?: string }> {
  const { userAId, userBId } = normalizePair(currentUserId, targetUserId);

  const { data: existingRows, error: findError } = await supabase
    .from("friendships")
    .select("id")
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId)
    .limit(1);

  if (findError) {
    return { error: findError.message };
  }

  const existingFriendship = existingRows?.[0];

  if (existingFriendship) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "friends" })
      .eq("id", existingFriendship.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  }

  const { error } = await supabase.from("friendships").insert({
    user_a_id: userAId,
    user_b_id: userBId,
    status: "friends",
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }

    return { error: error.message };
  }

  return { success: true };
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
  let blockedByMe = false;
  let blockedMe = false;
  let privateNote: string | null = null;

  if (!isSelf) {
    const blockState = await getBlockState(supabase, user.id, targetUserId);

    if (blockState.error) {
      return { error: "Could not load blocked user status." };
    }

    blockedByMe = blockState.blockedByMe ?? false;
    blockedMe = blockState.blockedMe ?? false;

    const { userAId, userBId } = normalizePair(user.id, targetUserId);

    const { data: friendshipRows, error: friendshipError } = await supabase
      .from("friendships")
      .select("id, status")
      .eq("user_a_id", userAId)
      .eq("user_b_id", userBId)
      .limit(1);

    if (friendshipError) {
      return { error: "Could not load friendship status." };
    }

    const friendshipRow = friendshipRows?.[0];
    const friendshipStatus = friendshipRow?.status ?? null;

    areFriends =
      !blockedByMe &&
      !blockedMe &&
      !!friendshipRow &&
      (friendshipStatus === "friends" || friendshipStatus === null);

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
      blockedByMe,
      blockedMe,
      isBlocked: blockedByMe || blockedMe,
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

  const blockState = await getBlockState(supabase, user.id, targetUserId);

  if (blockState.error) {
    return { error: "Could not check block status." };
  }

  if (blockState.blockedByMe) {
    return { error: "Unblock this user before adding them as a friend." };
  }

  if (blockState.blockedMe) {
    return { error: "You cannot add this user because they blocked you." };
  }

  const result = await setFriendshipStatus(supabase, user.id, targetUserId);

  if (result.error) {
    return result;
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

export async function blockUser(
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
    return { error: "You cannot block yourself." };
  }

  const { error: blockError } = await supabase.from("blocked_users").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  if (blockError && blockError.code !== "23505") {
    return { error: blockError.message };
  }

  const { userAId, userBId } = normalizePair(user.id, targetUserId);

  const { error: friendshipError } = await supabase
    .from("friendships")
    .delete()
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId);

  if (friendshipError) {
    return { error: friendshipError.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}

export async function unblockUser(
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
    return { error: "You cannot unblock yourself." };
  }

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

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

  const { data: existingRows, error: findError } = await supabase
    .from("user_profile_notes")
    .select("id")
    .eq("owner_id", user.id)
    .eq("target_user_id", targetUserId)
    .limit(1);

  if (findError) {
    return { error: findError.message };
  }

  const existingNote = existingRows?.[0];

  if (existingNote) {
    const { error } = await supabase
      .from("user_profile_notes")
      .update({
        note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingNote.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/protected/chat");
    return { success: true };
  }

  const { error } = await supabase.from("user_profile_notes").insert({
    owner_id: user.id,
    target_user_id: targetUserId,
    note,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}

export async function updateOwnProfile(input: {
  timezone: string;
  region: string;
  bio: string;
}): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const timezone = input.timezone.trim() || null;
  const region = input.region.trim().toUpperCase() || null;
  const bio = input.bio.trim() || null;

  if (region && !/^[A-Z]{2}$/.test(region)) {
    return { error: "Region must be a two-letter country code, like US." };
  }

  if (!validateTimezone(timezone)) {
    return {
      error: "Timezone must be a valid timezone, like America/Chicago.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      timezone,
      region,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/protected/chat");
  return { success: true };
}