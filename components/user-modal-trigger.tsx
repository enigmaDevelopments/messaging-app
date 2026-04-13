"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserModalData } from "@/types/user-modal";
import {
  addFriend,
  getUserModalData,
  removeFriend,
  savePrivateNote,
} from "@/lib/actions/user-modal-actions";

type UserModalTriggerProps = {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  mockData?: UserModalData;
};

function Avatar({
  username,
  avatarUrl,
  size = "md",
}: {
  username: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "sm"
      ? "h-8 w-8 text-sm"
      : size === "lg"
        ? "h-16 w-16 text-xl"
        : "h-10 w-10 text-base";

  const initial = username?.trim()?.[0]?.toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username ?? "User avatar"}
        className={`${sizeClasses} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} shrink-0 flex items-center justify-center rounded-full bg-muted font-semibold text-foreground`}
    >
      {initial}
    </div>
  );
}

function getStatusLabel(status: UserModalData["status"] | undefined) {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    default:
      return "Offline";
  }
}

function getFlagEmoji(region: string | null | undefined) {
  if (!region) return null;

  const code = region.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return null;
  }

  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export default function UserModalTrigger({
  userId,
  username,
  avatarUrl,
  mockData,
}: UserModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<UserModalData | null>(null);
  const [privateNote, setPrivateNote] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isMock = !!mockData;

  async function openModal() {
    setOpen(true);
    setActionError(null);
    setActionMessage(null);

    if (isMock) {
      setData(mockData ?? null);
      setPrivateNote(mockData?.privateNote ?? "");
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    if (data || isLoading) return;

    setIsLoading(true);
    setLoadError(null);

    const result = await getUserModalData(userId);

    if (result.error) {
      setLoadError(result.error);
      setIsLoading(false);
      return;
    }

    setData(result.data ?? null);
    setPrivateNote(result.data?.privateNote ?? "");
    setIsLoading(false);
  }

  function closeModal() {
    setOpen(false);
    setActionError(null);
    setActionMessage(null);
  }

  function handleFriendAction() {
    if (!data || data.isSelf) return;

    setActionError(null);
    setActionMessage(null);

    if (isMock) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              areFriends: !prev.areFriends,
            }
          : prev,
      );
      setActionMessage(data.areFriends ? "Friend removed." : "Friend added.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = data.areFriends
          ? await removeFriend(data.id)
          : await addFriend(data.id);

        if (result.error) {
          setActionError(result.error);
          return;
        }

        setData((prev) =>
          prev
            ? {
                ...prev,
                areFriends: !prev.areFriends,
              }
            : prev,
        );

        setActionMessage(data.areFriends ? "Friend removed." : "Friend added.");
      })();
    });
  }

  function handleSaveNote() {
    if (!data || data.isSelf) return;

    setActionError(null);
    setActionMessage(null);

    if (isMock) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              privateNote,
            }
          : prev,
      );
      setActionMessage("Private note saved.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await savePrivateNote(data.id, privateNote);

        if (result.error) {
          setActionError(result.error);
          return;
        }

        setData((prev) =>
          prev
            ? {
                ...prev,
                privateNote,
              }
            : prev,
        );

        setActionMessage("Private note saved.");
      })();
    });
  }

  const displayName = data?.username ?? username ?? "Unknown user";
  const displayAvatar = data?.avatar_url ?? avatarUrl;
  const displayStatus = data?.status;
  const flag = getFlagEmoji(data?.region);
  const displayBio = data?.bio?.trim() ? data.bio : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-accent"
      >
        <Avatar username={username} avatarUrl={avatarUrl} size="sm" />
        <span className="truncate font-medium">
          {username ?? "Unknown user"}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar
                  username={displayName}
                  avatarUrl={displayAvatar}
                  size="lg"
                />

                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-xl font-semibold leading-tight">
                    <span className="truncate">{displayName}</span>
                    {flag && <span className="text-2xl leading-none">{flag}</span>}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {data?.isSelf ? (
                      <Badge variant="secondary">This is you</Badge>
                    ) : data?.areFriends ? (
                      <Badge variant="secondary">Friend</Badge>
                    ) : (
                      <Badge variant="outline">Not friends</Badge>
                    )}

                    <Badge variant="outline">
                      {getStatusLabel(displayStatus)}
                    </Badge>
                  </div>

                </div>
              </div>

              <Button variant="ghost" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!isLoading && !loadError && displayBio && (
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {displayBio}
              </p>
            )}

            {isLoading ? (
              <div className="py-8 text-sm text-muted-foreground">
                Loading user details...
              </div>
            ) : loadError ? (
              <div className="py-4 text-sm text-destructive">{loadError}</div>
            ) : (
              <>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Timezone
                    </div>
                    <div>{data?.timezone ?? "Not listed"}</div>
                  </div>

                  {!data?.isSelf && (
                    <div className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          Private Note
                        </div>

                        <Button
                          onClick={handleSaveNote}
                          disabled={isPending}
                          size="sm"
                          variant="outline"
                        >
                          {isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>

                      <textarea
                        value={privateNote}
                        onChange={(e) => setPrivateNote(e.target.value)}
                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="Add a private note about this user..."
                      />
                    </div>
                  )}
                </div>

                {!data?.isSelf && (
                  <div className="mt-5 flex justify-center gap-3">
                    <Button onClick={handleFriendAction} disabled={isPending}>
                      {isPending
                        ? "Saving..."
                        : data?.areFriends
                          ? "Remove Friend"
                          : "Add Friend"}
                    </Button>

                    <Button variant="outline" disabled>
                      Message
                    </Button>
                  </div>
                )}

                {actionMessage && (
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    {actionMessage}
                  </p>
                )}

                {actionError && (
                  <p className="mt-3 text-center text-sm text-destructive">
                    {actionError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}