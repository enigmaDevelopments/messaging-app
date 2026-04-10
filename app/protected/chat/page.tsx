import { GroupMemberList } from "@/components/group-member-list";
import AddMemberForm from "@/components/add-member-form";
import { Suspense } from "react";

export default async function ChatPage() {
  const groupId = "group-id"; // groupid inside
  const isAdmin = true; //checking user role


  return (
    <div className="flex gap-8 h-[calc(100vh-12rem)]">
      {"chat area"}
      <div className="flex-1 flex flex-col bg-card border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
        <div className="flex-1 border-dashed border-2 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground italic">Chat Component Here</p>
        </div>
      </div>

      {"sidebar"}
      <div className="w-80 flex fle-col gap-6">
        <Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl"> /</div>}>
          <AddMemberForm groupId={groupId} />
        </Suspense>
        <Suspense fallback={<div className="flex-1 w-full animate-pulse bg-muted rounded-xl" />}>
          <GroupMemberList groupId={groupId} isAdmin={isAdmin} />
        </Suspense>
      </div>
    </div>
  );
}