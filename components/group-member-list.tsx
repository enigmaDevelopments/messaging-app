import { createClient } from "@/lib/supabase/server";
import { removeGroupMember } from "@/lib/actions/group-actions";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import UserModalTrigger from "./user-modal-trigger";

interface MemberListProps {
  groupId: string;
  isAdmin: boolean;
}

interface Member {
  id: string;
  role: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export async function GroupMemberList({
  groupId,
  isAdmin,
}: MemberListProps) {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("memberships")
    .select(
      `
        id,
        role,
        user_id,
        profiles (
          username,
          avatar_url
        )
      `,
    )
    .eq("group_id", groupId);

  if (error) {
    return <div className="text-sm text-destructive">Error loading members</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Members</h3>

      {(members as unknown as Member[]).map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-md border p-2"
        >
          <div className="min-w-0 flex-1">
            <UserModalTrigger
              userId={member.user_id}
              username={member.profiles?.username ?? null}
              avatarUrl={member.profiles?.avatar_url ?? null}
            />
          </div>

          <div className="ml-3 flex items-center gap-2">
            <Badge variant={member.role === "admin" ? "default" : "outline"}>
              {member.role}
            </Badge>

            {isAdmin && member.role !== "admin" && (
              <form
                action={async () => {
                  "use server";
                  await removeGroupMember(member.id);
                }}
              >
                <Button variant="destructive" size="sm">
                  Remove
                </Button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
