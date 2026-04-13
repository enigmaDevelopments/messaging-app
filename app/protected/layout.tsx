import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
        <Suspense fallback={<div className="w-64 bg-sidebar"></div>}> 
          <AppSidebar />
        </Suspense>
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Theme Switcher */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-8 bg-background">
            <ThemeSwitcher />
          </header>
          
          {/* background */}
          <div className="flex-1 p-8 bg-slate-50/50 dark:bg-zinc-950 overflow-y-auto">
            {children}
          </div>
        </main>
        </div>
    </SidebarProvider>
  );
}
