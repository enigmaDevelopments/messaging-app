import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { AuthButton } from "@/components/auth-button";
import { MessageSquare, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";



//sidebar
export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r">
      <SidebarHeader className="h-16 flex items-center px-4 font-bold border-b shrink-0">
        Chat App
      </SidebarHeader>

      {/* https://ui.shadcn.com/docs/components/radix/sidebar#structure */}
      <SidebarContent>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/protected"><LayoutDashboard /> <span>Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/protected/chat"><MessageSquare /> <span>Chat</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/protected/chat-fake-users"><MessageSquare /> <span>Chat-fake-users</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Suspense fallback={<div className="h-9 w-full animate-pulse bg-muted rounded-md"></div>}>
          <AuthButton />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}