"use client";

import { useState, useTransition } from "react";
import type { UserModalData } from "@/types/user-modal";
import {
  addFriend,
  blockUser,
  getUserModalData,
  removeFriend,
  savePrivateNote,
  unblockUser,
  updateOwnProfile,
} from "@/lib/actions/user-modal-actions";
import { Avatar } from "@/components/user-modal/avatar";
import { UserModalContent } from "@/components/user-modal/user-modal-content";
import {
  getCurrentTimeForTimezone,
  getFlagEmoji,
} from "@/components/user-modal/user-modal-utils";

type UserModalTriggerProps = {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  mockData?: UserModalData;
};

export default function UserModalTrigger({
  userId,
  username,
  avatarUrl,
  mockData,
}: UserModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<UserModalData | null>(null);
  const [privateNote, setPrivateNote] = useState("");
  const [editTimezone, setEditTimezone] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editBio, setEditBio] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isMock = !!mockData;

  function hydrateModalState(modalData: UserModalData | null | undefined) {
    setData(modalData ?? null);
    setPrivateNote(modalData?.privateNote ?? "");
    setEditTimezone(modalData?.timezone ?? "");
    setEditRegion(modalData?.region ?? "");
    setEditBio(modalData?.bio ?? "");
  }

  async function openModal() {
    setOpen(true);
    setActionError(null);
    setActionMessage(null);

    if (isMock) {
      hydrateModalState(mockData);
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

    hydrateModalState(result.data);
    setIsLoading(false);
  }

  function closeModal() {
    setOpen(false);
    setActionError(null);
    setActionMessage(null);
  }

  function handleFriendAction() {
    if (!data || data.isSelf || data.blockedByMe || data.blockedMe) return;

    setActionError(null);
    setActionMessage(null);

    const removingFriend = data.areFriends;

    if (isMock) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              areFriends: !prev.areFriends,
            }
          : prev,
      );

      setActionMessage(removingFriend ? "Friend removed." : "Friend added.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = removingFriend
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
                areFriends: !removingFriend,
              }
            : prev,
        );

        setActionMessage(removingFriend ? "Friend removed." : "Friend added.");
      })();
    });
  }

  function handleBlockAction() {
    if (!data || data.isSelf) return;

    setActionError(null);
    setActionMessage(null);

    const currentlyBlockedByMe = data.blockedByMe;

    if (isMock) {
      setData((prev) => {
        if (!prev) return prev;

        const nextBlockedByMe = !currentlyBlockedByMe;

        return {
          ...prev,
          areFriends: nextBlockedByMe ? false : prev.areFriends,
          blockedByMe: nextBlockedByMe,
          isBlocked: nextBlockedByMe || prev.blockedMe,
        };
      });

      setActionMessage(
        currentlyBlockedByMe ? "User unblocked." : "User blocked.",
      );
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = currentlyBlockedByMe
          ? await unblockUser(data.id)
          : await blockUser(data.id);

        if (result.error) {
          setActionError(result.error);
          return;
        }

        setData((prev) => {
          if (!prev) return prev;

          const nextBlockedByMe = !currentlyBlockedByMe;

          return {
            ...prev,
            areFriends: nextBlockedByMe ? false : prev.areFriends,
            blockedByMe: nextBlockedByMe,
            isBlocked: nextBlockedByMe || prev.blockedMe,
          };
        });

        setActionMessage(
          currentlyBlockedByMe ? "User unblocked." : "User blocked.",
        );
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

  function handleSaveOwnProfile() {
    if (!data?.isSelf) return;

    setActionError(null);
    setActionMessage(null);

    const savedTimezone = editTimezone.trim();
    const savedRegion = editRegion.trim().toUpperCase();
    const savedBio = editBio.trim();

    if (isMock) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              timezone: savedTimezone || null,
              region: savedRegion || null,
              bio: savedBio || null,
            }
          : prev,
      );

      setEditTimezone(savedTimezone);
      setEditRegion(savedRegion);
      setEditBio(savedBio);
      setActionMessage("Profile updated.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await updateOwnProfile({
          timezone: savedTimezone,
          region: savedRegion,
          bio: savedBio,
        });

        if (result.error) {
          setActionError(result.error);
          return;
        }

        setData((prev) =>
          prev
            ? {
                ...prev,
                timezone: savedTimezone || null,
                region: savedRegion || null,
                bio: savedBio || null,
              }
            : prev,
        );

        setEditTimezone(savedTimezone);
        setEditRegion(savedRegion);
        setEditBio(savedBio);
        setActionMessage("Profile updated.");
      })();
    });
  }

  const displayName = data?.username ?? username ?? "Unknown user";
  const displayAvatar = data?.avatar_url ?? avatarUrl;
  const flag = getFlagEmoji(data?.region);
  const displayBio = data?.bio?.trim() ? data.bio : null;
  const localTime = getCurrentTimeForTimezone(data?.timezone);
  const blockedByMe = data?.blockedByMe ?? false;
  const blockedMe = data?.blockedMe ?? false;
  const hasBlock = blockedByMe || blockedMe;

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
        <UserModalContent
          data={data}
          displayName={displayName}
          displayAvatar={displayAvatar}
          flag={flag}
          displayBio={displayBio}
          localTime={localTime}
          blockedByMe={blockedByMe}
          blockedMe={blockedMe}
          hasBlock={hasBlock}
          privateNote={privateNote}
          setPrivateNote={setPrivateNote}
          editTimezone={editTimezone}
          setEditTimezone={setEditTimezone}
          editRegion={editRegion}
          setEditRegion={setEditRegion}
          editBio={editBio}
          setEditBio={setEditBio}
          isLoading={isLoading}
          loadError={loadError}
          actionMessage={actionMessage}
          actionError={actionError}
          isPending={isPending}
          onClose={closeModal}
          onSaveNote={handleSaveNote}
          onSaveOwnProfile={handleSaveOwnProfile}
          onFriendAction={handleFriendAction}
          onBlockAction={handleBlockAction}
        />
      )}
    </>
  );
}