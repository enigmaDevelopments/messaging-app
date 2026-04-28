"use client";

import { Button } from "@/components/ui/button";

type UserModalFooterActionsProps = {
  areFriends: boolean;
  blockedByMe: boolean;
  hasBlock: boolean;
  isPending: boolean;
  onFriendAction: () => void;
  onBlockAction: () => void;
};

export function UserModalFooterActions({
  areFriends,
  blockedByMe,
  hasBlock,
  isPending,
  onFriendAction,
  onBlockAction,
}: UserModalFooterActionsProps) {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      {!hasBlock && (
        <Button onClick={onFriendAction} disabled={isPending}>
          {isPending
            ? "Saving..."
            : areFriends
              ? "Remove Friend"
              : "Add Friend"}
        </Button>
      )}

      <Button
        variant={blockedByMe ? "outline" : "destructive"}
        onClick={onBlockAction}
        disabled={isPending}
      >
        {isPending ? "Saving..." : blockedByMe ? "Unblock" : "Block"}
      </Button>

      <Button variant="outline" disabled={hasBlock}>
        Message
      </Button>
    </div>
  );
}