"use client";
import type { StaffRatingEvent } from "@/lib/types";

export async function listRatingEvents(staffId: string, limit = 20): Promise<StaffRatingEvent[]> {
  const params = new URLSearchParams({ staffId, limit: String(limit) });
  const res = await fetch(`/api/staff/ratings/list?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to list rating events");
  return (data?.items || []) as StaffRatingEvent[];
}

export async function adjustRating(input: { staffId: string; delta: number; reason: string; relatedComplaintId?: string | null }): Promise<{ ok: boolean }>{
  const res = await fetch(`/api/staff/ratings/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to adjust rating");
  return data as { ok: boolean };
}
