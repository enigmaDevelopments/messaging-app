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
  isSelf: boolean;
};