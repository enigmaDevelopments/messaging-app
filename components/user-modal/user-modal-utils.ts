import type { UserModalData } from "@/types/user-modal";

export function getStatusLabel(status: UserModalData["status"] | undefined) {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    default:
      return "Offline";
  }
}

export function getFlagEmoji(region: string | null | undefined) {
  if (!region) return null;

  const code = region.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return null;
  }

  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function getCurrentTimeForTimezone(
  timezone: string | null | undefined,
) {
  if (!timezone) return null;

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
      timeZoneName: "short",
    }).format(new Date());
  } catch {
    return null;
  }
}