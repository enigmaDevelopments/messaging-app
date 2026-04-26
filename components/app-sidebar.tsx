import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AuthButton } from "@/components/auth-button";
import { MessageSquare, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button"; // Import Button
import { createClient } from "@/lib/supabase/server"; // Import server client
import AddFriendSearch from "@/components/add-friend-search"; // Import AddFriendSearch
import SidebarDMList from "@/components/sidebar-dm-list"; // Import SidebarDMList



//sidebar
export async function AppSidebar() { // Make it async
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); // Fetch user

  const currentUserId = user?.id || null; // Get current user ID

  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 font-bold border-b shrink-0">
        Chat App
      </SidebarHeader>

      {/* https://ui.shadcn.com/docs/components/radix/sidebar#structure */}
      <SidebarContent>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/protected"><LayoutDashboard /> <span>Dashboard</span></Link>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/protected/chat"><MessageSquare /> <span>Chat</span></Link>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/protected/chat-fake-users"><MessageSquare /> <span>Chat-fake-users</span></Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* add friend search */}
        {currentUserId && (
          <div className="p-2 border-b"> {/* Added padding and border for separation */}
            <AddFriendSearch currentUserId={currentUserId} />
          </div>
        )}

        {/* Direct Messages list below navigation */}
        {currentUserId && <SidebarDMList currentUserId={currentUserId} />}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Suspense fallback={<div className="h-9 w-full animate-pulse bg-muted rounded-md"></div>}>
          <AuthButton />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}