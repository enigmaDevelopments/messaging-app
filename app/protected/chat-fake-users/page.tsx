import AddMemberForm from "@/components/add-member-form";
import UserModalTrigger from "@/components/user-modal-trigger";
import { Suspense } from "react";
import type { UserModalData } from "@/types/user-modal";

const mockUsers: UserModalData[] = [
  {
    id: "mock-user-1",
    username: "Alexandra",
    avatar_url: null,
    timezone: "America/Chicago",
    region: "US",
    bio: "Insert generic bio here",
    status: "online",
    privateNote: "Alexandra likes cats.",
    areFriends: true,
    isSelf: false,
  },
  {
    id: "mock-user-2",
    username: "João",
    avatar_url: null,
    timezone: "America/Sao_Paulo",
    region: "BR",
    bio: "CAMPEÃO DO MUNDO!",
    status: "away",
    privateNote: "João João João",
    areFriends: false,
    isSelf: false,
  },
  {
    id: "mock-user-3",
    username: "Sarah",
    avatar_url: null,
    timezone: "Europe/London",
    region: "GB",
    bio: "",
    status: "offline",
    privateNote: "Lorem ipsum dolor sit amet consectetur adipiscing elit",
    areFriends: true,
    isSelf: false,
  },
];

export default async function ChatPage() {
  const groupId = "group-id";
  const isAdmin = true;

  return (
    <div className="flex gap-8 h-[calc(100vh-12rem)]">
      <div className="flex-1 flex flex-col bg-card border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Chat Room</h1>

        <div className="flex-1 border-dashed border-2 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground italic">Chat Component Here</p>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-6">
        <Suspense
          fallback={
            <div className="h-32 w-full animate-pulse bg-muted rounded-xl" />
          }
        >
          <AddMemberForm groupId={groupId} />
        </Suspense>

        <div className="flex-1 w-full rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-3">Members</h2>

          <div className="space-y-2">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border p-2"
              >
                <UserModalTrigger
                  userId={user.id}
                  username={user.username}
                  avatarUrl={user.avatar_url}
                  mockData={user}
                />
              </div>
            ))}
          </div>
        </div>

        {/*
        Re-enable this when you have a real group id and memberships working:

        <Suspense
          fallback={
            <div className="flex-1 w-full animate-pulse bg-muted rounded-xl" />
          }
        >
          <GroupMemberList groupId={groupId} isAdmin={isAdmin} />
        </Suspense>
        */}
      </div>
    </div>
  );
}