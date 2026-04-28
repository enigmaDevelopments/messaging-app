"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserModalData } from "@/types/user-modal";
import { Avatar } from "./avatar";
import { getStatusLabel } from "./user-modal-utils";

type UserModalHeaderProps = {
  displayName: string;
  displayAvatar: string | null;
  flag: string | null;
  status: UserModalData["status"] | undefined;
  isSelf: boolean;
  areFriends: boolean;
  blockedByMe: boolean;
  blockedMe: boolean;
  onClose: () => void;
};

export function UserModalHeader({
  displayName,
  displayAvatar,
  flag,
  status,
  isSelf,
  areFriends,
  blockedByMe,
  blockedMe,
  onClose,
}: UserModalHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar username={displayName} avatarUrl={displayAvatar} size="lg" />

        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold leading-tight">
            <span className="truncate">{displayName}</span>
            {flag && <span className="text-2xl leading-none">{flag}</span>}
          </h2>

          <div className="mt-2 flex flex-wrap gap-2">
            {isSelf ? (
              <Badge variant="secondary">This is you</Badge>
            ) : blockedByMe ? (
              <Badge variant="destructive">Blocked</Badge>
            ) : blockedMe ? (
              <Badge variant="destructive">Blocked you</Badge>
            ) : areFriends ? (
              <Badge variant="secondary">Friend</Badge>
            ) : (
              <Badge variant="outline">Not Friends</Badge>
            )}

            <Badge variant="outline">{getStatusLabel(status)}</Badge>
          </div>
        </div>
      </div>

      <Button variant="ghost" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}