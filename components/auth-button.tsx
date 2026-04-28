import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import UserModalTrigger from "@/components/user-modal-trigger";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user?.sub) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant="default">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.sub)
    .maybeSingle();

  return (
    <div className="flex items-center gap-2">
      <UserModalTrigger
        userId={user.sub}
        username={profile?.username ?? user.email ?? "My Profile"}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <LogoutButton />
    </div>
  );
}