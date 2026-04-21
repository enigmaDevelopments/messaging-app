import { redirect } from "next/navigation";
import { Suspense } from "react";

import { GroupMemberList } from "@/components/group-member-list";
import AddMemberForm from "@/components/add-member-form";
import { ChatShell } from "@/components/chat/chat-shell";
import { createClient } from "@/lib/supabase/server";
import { getChatConversations } from "@/lib/chat/chat-data";

type ChatPageContentProps = {
  searchParams?: Promise<{
    conversation?: string;
  }>;
};

export async function ChatPageContent({
  searchParams,
}: ChatPageContentProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const isAdmin = true;
  const { conversations, isFallback } = await getChatConversations(
    supabase,
    user.id,
  );
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const conversationId = resolvedSearchParams?.conversation;
  const selectedConversation =
    conversations.find((conversation) => conversation.id === conversationId) ??
    conversations[0];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-4">
      <div className="min-h-0 min-w-0 overflow-hidden">
        <ChatShell
          currentUserId={user.id}
          currentUserLabel={user.email ?? "You"}
          initialConversations={conversations}
          initialConversationId={selectedConversation?.id ?? ""}
          isFallback={isFallback}
        />
      </div>

      <div className="flex min-h-0 w-full flex-col gap-3 overflow-hidden xl:overflow-hidden">
        <Suspense
          fallback={
            <div className="h-28 w-full animate-pulse rounded-lg bg-muted" />
          }
        >
          <AddMemberForm groupId={selectedConversation?.id ?? ""} />
        </Suspense>
        <Suspense
          fallback={
            <div className="flex-1 w-full animate-pulse rounded-lg bg-muted" />
          }
        >
          {selectedConversation?.id ? (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-card p-3">
              <GroupMemberList
                groupId={selectedConversation.id}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              Join or create a group to start messaging.
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
