"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { findOrCreateDirectConversationByUsername } from "@/lib/actions/group-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function StartDmForm() {
  const router = useRouter();
  const [targetUsername, setTargetUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await findOrCreateDirectConversationByUsername(
      targetUsername.trim(),
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setTargetUsername("");
    setLoading(false);
    setOpen(false);
    router.push(`/protected/chat?conversation=${result.conversationId}`);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" aria-label="Start direct message">
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Start Direct Message</SheetTitle>
          <SheetDescription>
            Enter a username to find or create a conversation.
          </SheetDescription>
        </SheetHeader>
        <form className="flex flex-col gap-3 px-4 pb-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Enter username"
            value={targetUsername}
            onChange={(event) => setTargetUsername(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Starting..." : "Start DM"}
          </Button>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </form>
      </SheetContent>
    </Sheet>
  );
}
