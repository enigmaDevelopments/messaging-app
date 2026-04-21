import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  status: string;
  messages: ChatMessage[];
};

type MembershipRow = {
  group_id: string;
  groups: {
    id: string;
    name: string | null;
  }[];
};

type MessageRow = {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
};

export const fallbackConversations: ChatConversation[] = [
  {
    id: "group-id",
    name: "Group Project",
    status: "Using fallback data",
    messages: [
      {
        id: "m-1",
        senderId: "user-sam",
        senderName: "Sam",
        text: "This is a test message.",
        createdAt: "9:12 AM",
      },
      {
        id: "m-2",
        senderId: "user-you",
        senderName: "You",
        text: "This is also a test message.",
        createdAt: "9:14 AM",
      },
    ],
  },
];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function getChatConversations(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select(
      `
        group_id,
        groups (
          id,
          name
        )
      `,
    )
    .eq("user_id", userId);

  if (membershipsError) {
    console.error("Error loading memberships:", membershipsError.message);
    return {
      conversations: fallbackConversations,
      isFallback: true,
    };
  }

  const membershipRows = (memberships ?? []) as MembershipRow[];
  const groupIds = membershipRows
    .map((membership) => membership.group_id)
    .filter(Boolean);

  if (!groupIds.length) {
    return {
      conversations: [],
      isFallback: false,
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
        id,
        group_id,
        sender_id,
        content,
        created_at
      `,
    )
    .in("group_id", groupIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error.message);
    return {
      conversations: fallbackConversations,
      isFallback: true,
    };
  }

  const senderIds = Array.from(
    new Set(((data ?? []) as MessageRow[]).map((message) => message.sender_id)),
  );

  const usernameById = new Map<string, string>();

  if (senderIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", senderIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError.message);
    } else {
      ((profiles ?? []) as ProfileRow[]).forEach((profile) => {
        if (profile.username) {
          usernameById.set(profile.id, profile.username);
        }
      });
    }
  }

  const messagesByGroup = new Map<string, ChatMessage[]>();

  ((data ?? []) as MessageRow[]).forEach((message) => {
    const nextMessage: ChatMessage = {
      id: message.id,
      senderId: message.sender_id,
      senderName:
        message.sender_id === userId
          ? "You"
          : usernameById.get(message.sender_id) ?? "Member",
      text: message.content,
      createdAt: formatTimestamp(message.created_at),
    };

    const currentMessages = messagesByGroup.get(message.group_id) ?? [];
    currentMessages.push(nextMessage);
    messagesByGroup.set(message.group_id, currentMessages);
  });

  const conversations = membershipRows.map((membership) => {
    const messages = messagesByGroup.get(membership.group_id) ?? [];
    const groupName = membership.groups?.[0]?.name?.trim();

    return {
      id: membership.group_id,
      name: groupName || "Untitled Conversation",
      status: `${messages.length} message${messages.length === 1 ? "" : "s"}`,
      messages,
    };
  });

  return {
    conversations,
    isFallback: false,
  };
}
