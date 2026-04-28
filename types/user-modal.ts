export type UserModalData = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  timezone: string | null;
  region: string | null;
  bio: string | null;
  status: "online" | "away" | "offline";
  privateNote: string | null;
  areFriends: boolean;
  blockedByMe: boolean;
  blockedMe: boolean;
  isBlocked: boolean;
  isSelf: boolean;
};