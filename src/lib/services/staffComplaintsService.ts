"use client";
import type { StaffComplaint, ComplaintSeverity, ComplaintStatus } from "@/lib/types";

export async function createComplaint(input: { staffId: string; title: string; description?: string; severity: ComplaintSeverity; initialDeduction?: number }) : Promise<StaffComplaint> {
  const res = await fetch('/api/staff/complaints/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to create complaint');
  return data as StaffComplaint;
}

export async function listComplaints(filters: { staffId?: string; status?: ComplaintStatus; severity?: ComplaintSeverity; q?: string; limit?: number } = {}) : Promise<StaffComplaint[]> {
  const params = new URLSearchParams();
  if (filters.staffId) params.set('staffId', filters.staffId);
  if (filters.status) params.set('status', filters.status);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.q) params.set('q', filters.q);
  if (filters.limit) params.set('limit', String(filters.limit));
  const res = await fetch(`/api/staff/complaints/list?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to list complaints');
  return (data?.items || []) as StaffComplaint[];
}

export async function updateComplaint(id: string, updates: Partial<{ status: ComplaintStatus; resolutionNotes: string | null; rewardDelta: number }>) : Promise<StaffComplaint> {
  const res = await fetch('/api/staff/complaints/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, updates }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to update complaint');
  return data as StaffComplaint;
}
