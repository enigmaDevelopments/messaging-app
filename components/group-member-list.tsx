import { createClient } from "@/lib/supabase/server";
import { removeGroupMember } from "@/lib/actions/group-actions";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface MemberListProps {
  groupId: string;
  isAdmin: boolean
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

export async function GroupMemberList({ groupId, isAdmin }: MemberListProps){
  const supabase = await createClient();

  //fetching memberships
  const { data: members, error } = await supabase
    .from("memberships")
    .select(`
      id,
      role,
      user_id,
      profiles (
        username,
        avatar_url
      )`)
    .eq("group_id", groupId);
    
  if (error) {
    return <div className="text-destructive">Error loading 
    members</div>;
  }
  
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-bold text-lg mb-2">Members</h3>
      <div className="space-y-2">
        {(members as unknown as Member[]).map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-accent/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} alt={member.profiles.username ?? "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs uppercase font-bold">
                    {member.profiles?.username?.[0]}

                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{member.profiles?.username}</span>
                <Badge variant="secondary" className="w-fit text-[10px] px-1 py-0 h-4">
                  {member.role}
                </Badge>
              </div>
            </div>
            
            {isAdmin && member.role !== "admin" && (
              <form action={async () => { "use server"; await removeGroupMember(member.id)}}>
                <Button variant="ghost" size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Remove
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}