import { Suspense } from "react";
import { ChatPageContent } from "@/components/chat/chat-page-content";

type ChatPageProps = {
  searchParams?: Promise<{
    conversation?: string;
  }>;
};

export default function ChatPage({ searchParams }: ChatPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-12rem)] gap-8">
          <div className="flex-1 rounded-xl border bg-card animate-pulse" />
          <div className="w-80 rounded-xl border bg-card animate-pulse" />
        </div>
      }
    >
      <ChatPageContent searchParams={searchParams} />
    </Suspense>
  );
}
