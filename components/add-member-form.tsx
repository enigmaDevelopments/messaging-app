"use client"

import { useState } from "react";
import { addGroupMember } from "@/lib/actions/group-actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AddMemberFormProps {
  groupId: string;
}

export default function AddMemberForm({ groupId }: AddMemberFormProps){
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await addGroupMember(groupId, userId);
    if (result.error) {
      setError(result.error);
    } else {
      setUserId(""); //clears input when successful
    }
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <h3 className="mb-1 text-base font-semibold">Add Member</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="sm:self-start">
          {loading ? "Adding..." : "Add"}
        </Button>
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </form>
  );
}
