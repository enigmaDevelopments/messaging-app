"use client";

import { Button } from "@/components/ui/button";
import { REGION_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/profile-options";

type SelfProfileEditorProps = {
  editTimezone: string;
  setEditTimezone: (value: string) => void;
  editRegion: string;
  setEditRegion: (value: string) => void;
  editBio: string;
  setEditBio: (value: string) => void;
  isPending: boolean;
  onSave: () => void;
};

export function SelfProfileEditor({
  editTimezone,
  setEditTimezone,
  editRegion,
  setEditRegion,
  editBio,
  setEditBio,
  isPending,
  onSave,
}: SelfProfileEditorProps) {
  const timezoneExists = TIMEZONE_OPTIONS.some(
    (timezone) => timezone.value === editTimezone,
  );

  const regionExists = REGION_OPTIONS.some(
    (region) => region.value === editRegion,
  );

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Edit Public Profile
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Timezone
        </label>
        <select
          value={editTimezone}
          onChange={(e) => setEditTimezone(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {!timezoneExists && editTimezone && (
            <option value={editTimezone}>{editTimezone}</option>
          )}

          {TIMEZONE_OPTIONS.map((timezone) => (
            <option key={timezone.value} value={timezone.value}>
              {timezone.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Region
        </label>
        <select
          value={editRegion}
          onChange={(e) => setEditRegion(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {!regionExists && editRegion && (
            <option value={editRegion}>{editRegion}</option>
          )}

          {REGION_OPTIONS.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Profile Description
        </label>
        <textarea
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Write a short profile description..."
        />
      </div>

      <div className="flex justify-center">
        <Button onClick={onSave} disabled={isPending} size="sm">
            {isPending ? "Saving..." : "Save Profile"}
        </Button>
        </div>
    </div>
  );
}