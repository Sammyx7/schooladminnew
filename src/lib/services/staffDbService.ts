'use client';

import { getSupabase } from '@/lib/supabaseClient';
import type { AdminStaffListItem, StaffProfile } from '@/lib/types';

export async function listStaff(): Promise<AdminStaffListItem[]> {
  const res = await fetch('/api/staff/list', { method: 'GET' });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `List failed with status ${res.status}`);
  }
  return payload as AdminStaffListItem[];
}

export interface CreateStaffInput {
  staffId?: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  joiningDate: string; // ISO string
  qualifications?: string[];
  avatarUrl?: string;
  assignments?: {
    className: string;
    section: string;
    subject?: string;
    isClassTeacher?: boolean;
  }[];
}

export async function createStaff(input: CreateStaffInput): Promise<AdminStaffListItem> {
  const res = await fetch('/api/staff/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Create failed with status ${res.status}`);
  }
  return payload as AdminStaffListItem;
}

export async function deleteStaff(idOrStaffId: string): Promise<void> {
  // Use server API to bypass RLS and rely on service key
  const res = await fetch('/api/staff/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idOrStaffId }),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Delete failed with status ${res.status}`);
  }
}

export async function getStaffProfileByStaffId(staffId: string): Promise<StaffProfile | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('staff')
      .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
      .eq('staff_id', staffId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        id: String(data.id),
        staffId: data.staff_id,
        name: data.name,
        role: data.role,
        department: data.department,
        email: data.email,
        phone: data.phone ?? '',
        dateOfJoining: data.joining_date,
        qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
        avatarUrl: data.avatar_url ?? undefined,
      };
    }
  }
  // Fallback to server route (service role) to bypass client env/RLS issues
  const res = await fetch(`/api/staff/profile?staffId=${encodeURIComponent(staffId)}`);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Profile fetch failed (${res.status})`);
  }
  const payload = await res.json();
  return payload as StaffProfile | null;
}

export async function getStaffProfileByEmail(email: string): Promise<StaffProfile | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('staff')
      .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        id: String(data.id),
        staffId: data.staff_id,
        name: data.name,
        role: data.role,
        department: data.department,
        email: data.email,
        phone: data.phone ?? '',
        dateOfJoining: data.joining_date,
        qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
        avatarUrl: data.avatar_url ?? undefined,
      };
    }
  }
  // Fallback to server route (service role)
  const res = await fetch(`/api/staff/profile?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Profile fetch failed (${res.status})`);
  }
  const payload = await res.json();
  return payload as StaffProfile | null;
}

export interface UpdateStaffInput {
  name?: string;
  role?: string;
  department?: string;
  email?: string;
  phone?: string | null;
  joiningDate?: string; // ISO
  qualifications?: string[] | null;
  avatarUrl?: string | null;
}

export async function updateStaff(staffId: string, updates: UpdateStaffInput): Promise<AdminStaffListItem> {
  // Use server API route to perform update with service role
  const res = await fetch('/api/staff/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, updates }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Update failed with status ${res.status}`);
  }
  return payload as AdminStaffListItem;
}

// Bulk import staff via CSV (server-side route consumes multipart/form-data)
export async function importStaffCsv(file: File): Promise<{ ok: boolean; processed: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/staff/import', { method: 'POST', body: form });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Import failed with status ${res.status}`);
  }
  return payload as { ok: boolean; processed: number };
}

// Helper to set staff password after verifying staffId + name on the server.
// Calls the server route at `/api/auth/staff/set-password` which uses the Supabase service role.
export async function setStaffPassword(
  staffId: string,
  name: string,
  password: string,
): Promise<{ ok: boolean; created?: boolean; updated?: boolean; linked?: boolean }> {
  const res = await fetch('/api/auth/staff/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, name, password }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Set password failed with status ${res.status}`);
  }
  return payload as { ok: boolean; created?: boolean; updated?: boolean; linked?: boolean };
}
