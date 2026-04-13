import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
//import { Suspense } from "react";

/*  old starter function
async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
} */

//get user
async function DashboardHeader(){
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }


  return (

    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {data.user.email}!</p>
    </div>
  );
}

export default function ProtectedPage() {
  return (
      <div className="flex flex-col gap-6">
        <Suspense fallback={<div className="h-9 w-full animate-pulse bg-muted rounded-md"></div>}>
          <DashboardHeader />
        </Suspense>

        {/* Main content area
          I just put these box slots here for now just to show the space.
          We could maybe have user be able to set a background image or just leave it plain and blank until the user clicks on a specific chat.
        */}

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-h-[200px] flex items-center justify-center border-dashed">
          <p className="text-sm text-muted-foreground">Main content slot 1</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-h-[200px] flex items-center justify-center border-dashed">
          <p className="text-sm text-muted-foreground">Main content slot 2</p>
        </div>
      </div>
  );
}
