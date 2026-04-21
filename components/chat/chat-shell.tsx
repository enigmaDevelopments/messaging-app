"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StartDmForm } from "@/components/chat/start-dm-form";
import type {
  ChatConversation as Conversation,
  ChatMessage as Message,
} from "@/lib/chat/chat-data";

type ChatShellProps = {
  currentUserId: string;
  currentUserLabel: string;
  initialConversations: Conversation[];
  initialConversationId: string;
  isFallback: boolean;
};

export function ChatShell({
  currentUserId,
  currentUserLabel,
  initialConversations,
  initialConversationId,
  isFallback,
}: ChatShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversationId || initialConversations[0]?.id || "",
  );
  const [draft, setDraft] = useState("");

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? conversations[0]
    );
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId || isFallback) {
      return;
    }

    const supabase = createClient();
    let isCancelled = false;
    let subscribedChannel:
      | ReturnType<typeof supabase.channel>
      | undefined;

    async function setupRealtime() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      if (isCancelled) {
        return;
      }

      subscribedChannel = supabase
        .channel(
          `messages:${activeConversationId}:${currentUserId}:${crypto.randomUUID()}`,
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `group_id=eq.${activeConversationId}`,
          },
          (payload) => {
            const insertedMessage = payload.new as {
              id: string;
              group_id: string;
              sender_id: string;
              content: string;
              created_at: string;
            };

            setConversations((currentConversations) =>
              currentConversations.map((conversation) => {
                if (conversation.id !== insertedMessage.group_id) {
                  return conversation;
                }

                const alreadyExists = conversation.messages.some(
                  (message) => message.id === insertedMessage.id,
                );

                if (alreadyExists) {
                  return conversation;
                }

                const nextMessage: Message = {
                  id: insertedMessage.id,
                  senderId: insertedMessage.sender_id,
                  senderName:
                    insertedMessage.sender_id === currentUserId
                      ? "You"
                      : "Member",
                  text: insertedMessage.content,
                  createdAt: new Date(
                    insertedMessage.created_at,
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                };

                return {
                  ...conversation,
                  status: `${conversation.messages.length + 1} messages`,
                  messages: [...conversation.messages, nextMessage],
                };
              }),
            );
          },
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      isCancelled = true;
      if (subscribedChannel) {
        supabase.removeChannel(subscribedChannel);
      }
    };
  }, [activeConversationId, currentUserId, isFallback]);

  function handleConversationSelect(conversationId: string) {
    setActiveConversationId(conversationId);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("conversation", conversationId);
    router.replace(`${pathname}?${nextParams.toString()}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDraft = draft.trim();

    if (!trimmedDraft || !activeConversation) {
      return;
    }

    const messageId = crypto.randomUUID();
    const createdAtIso = new Date().toISOString();
    const nextMessage: Message = {
      id: messageId,
      senderId: currentUserId,
      senderName: currentUserLabel,
      text: trimmedDraft,
      createdAt: new Date(createdAtIso).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              status: `${conversation.messages.length + 1} messages`,
              messages: [...conversation.messages, nextMessage],
            }
          : conversation,
      ),
    );
    setDraft("");

    if (isFallback) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      id: messageId,
      group_id: activeConversation.id,
      sender_id: currentUserId,
      content: trimmedDraft,
      created_at: createdAtIso,
    });

    if (error) {
      console.error("Error sending message:", error.message);
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                status: `${Math.max(
                  conversation.messages.length - 1,
                  0,
                )} message${
                  Math.max(conversation.messages.length - 1, 0) === 1
                    ? ""
                    : "s"
                }`,
                messages: conversation.messages.filter(
                  (message) => message.id !== nextMessage.id,
                ),
              }
            : conversation,
        ),
      );
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden xl:grid xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-4">
      <aside className="w-full shrink-0 rounded-lg border bg-card xl:flex xl:min-h-0 xl:flex-col xl:overflow-hidden">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight">Messages</h1>
            <StartDmForm />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isFallback
              ? "Using fallback data until the messages table is ready."
              : "Loaded from Supabase."}
          </p>
        </div>

        <div className="space-y-1.5 p-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
          {conversations.length ? conversations.map((conversation) => {
            const lastMessage =
              conversation.messages[conversation.messages.length - 1];
            const isActive = conversation.id === activeConversation?.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => handleConversationSelect(conversation.id)}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "border-primary/50 bg-primary/10 shadow-sm"
                    : "border-transparent hover:border-border hover:bg-muted/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="truncate pr-2 text-sm font-medium">
                    {conversation.name}
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                    {lastMessage?.createdAt}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {lastMessage?.text ?? "No messages yet"}
                </p>
              </button>
            );
          }) : (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No conversations yet.
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-[28rem] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card xl:min-h-0 xl:h-full">
        <div className="shrink-0 border-b bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{activeConversation?.name}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeConversation?.status}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {activeConversation?.messages.length ? activeConversation.messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-md px-3 py-2.5 shadow-sm ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] leading-none">
                    <span className="font-semibold">{message.senderName}</span>
                    <span
                      className={
                        isOwnMessage
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }
                    >
                      {message.createdAt}
                    </span>
                  </div>
                  <p className="text-sm leading-6">{message.text}</p>
                </div>
              </div>
            );
          }) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No messages yet for this group.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 border-t bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message"
              rows={3}
              className="min-h-16 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 lg:w-auto xl:shrink-0"
            >
              <SendHorizontal className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
