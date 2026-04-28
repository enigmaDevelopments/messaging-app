"use client";

import { Button } from "@/components/ui/button";

type PrivateNoteEditorProps = {
  privateNote: string;
  setPrivateNote: (value: string) => void;
  isPending: boolean;
  onSave: () => void;
};

export function PrivateNoteEditor({
  privateNote,
  setPrivateNote,
  isPending,
  onSave,
}: PrivateNoteEditorProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Private Note
        </div>

        <Button onClick={onSave} disabled={isPending} size="sm" variant="outline">
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
  );
}