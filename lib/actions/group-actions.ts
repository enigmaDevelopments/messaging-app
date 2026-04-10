"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// add user to group by ID
export async function addGroupMember(groupId: string, userId: string, role: string = "member") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .insert({ group_id: groupId, user_id: userId, role })
  
    if (error){
      console.error("Error adding member:", error.message);
      return { error: error.message };
    }

    revalidatePath("/app/chat.tsx");
    return { success: true };
}

// remove user from a group
export async function removeGroupMember(membershipId: string){
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);
    
  if (error){
    console.error("Error removing member:", error.message);
    return { error: error.message };
  }

  revalidatePath("/app/protected/chat.tsx");
  return { success: true };
}

