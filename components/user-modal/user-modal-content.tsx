"use client";

import type { UserModalData } from "@/types/user-modal";
import { UserModalHeader } from "./user-modal-header";
import { SelfProfileEditor } from "./self-profile-editor";
import { PrivateNoteEditor } from "./private-note-editor";
import { UserModalFooterActions } from "./user-modal-footer-actions";

type UserModalContentProps = {
  data: UserModalData | null;
  displayName: string;
  displayAvatar: string | null;
  flag: string | null;
  displayBio: string | null;
  localTime: string | null;
  blockedByMe: boolean;
  blockedMe: boolean;
  hasBlock: boolean;
  privateNote: string;
  setPrivateNote: (value: string) => void;
  editTimezone: string;
  setEditTimezone: (value: string) => void;
  editRegion: string;
  setEditRegion: (value: string) => void;
  editBio: string;
  setEditBio: (value: string) => void;
  isLoading: boolean;
  loadError: string | null;
  actionMessage: string | null;
  actionError: string | null;
  isPending: boolean;
  onClose: () => void;
  onSaveNote: () => void;
  onSaveOwnProfile: () => void;
  onFriendAction: () => void;
  onBlockAction: () => void;
};

export function UserModalContent({
  data,
  displayName,
  displayAvatar,
  flag,
  displayBio,
  localTime,
  blockedByMe,
  blockedMe,
  hasBlock,
  privateNote,
  setPrivateNote,
  editTimezone,
  setEditTimezone,
  editRegion,
  setEditRegion,
  editBio,
  setEditBio,
  isLoading,
  loadError,
  actionMessage,
  actionError,
  isPending,
  onClose,
  onSaveNote,
  onSaveOwnProfile,
  onFriendAction,
  onBlockAction,
}: UserModalContentProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <UserModalHeader
          displayName={displayName}
          displayAvatar={displayAvatar}
          flag={flag}
          status={data?.status}
          isSelf={data?.isSelf ?? false}
          areFriends={data?.areFriends ?? false}
          blockedByMe={blockedByMe}
          blockedMe={blockedMe}
          onClose={onClose}
        />

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
        ) : !data ? (
          <div className="py-4 text-sm text-destructive">
            Could not load user details.
          </div>
        ) : (
          <>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Timezone
                </div>

                <div>{data.timezone ?? "Not listed"}</div>

                {localTime && (
                  <div className="mt-1 text-muted-foreground">
                    Current time: {localTime}
                  </div>
                )}
              </div>

              {data.isSelf && (
                <SelfProfileEditor
                  editTimezone={editTimezone}
                  setEditTimezone={setEditTimezone}
                  editRegion={editRegion}
                  setEditRegion={setEditRegion}
                  editBio={editBio}
                  setEditBio={setEditBio}
                  isPending={isPending}
                  onSave={onSaveOwnProfile}
                />
              )}

              {!data.isSelf && (
                <PrivateNoteEditor
                  privateNote={privateNote}
                  setPrivateNote={setPrivateNote}
                  isPending={isPending}
                  onSave={onSaveNote}
                />
              )}
            </div>

            {!data.isSelf && (
              <UserModalFooterActions
                areFriends={data.areFriends}
                blockedByMe={blockedByMe}
                hasBlock={hasBlock}
                isPending={isPending}
                onFriendAction={onFriendAction}
                onBlockAction={onBlockAction}
              />
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
  );
}