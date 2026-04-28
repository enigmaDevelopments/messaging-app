type AvatarProps = {
  username: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ username, avatarUrl, size = "md" }: AvatarProps) {
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