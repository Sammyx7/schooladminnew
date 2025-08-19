'use client';

import { getSupabase } from '@/lib/supabaseClient';
import type { AdminStaffListItem, StaffProfile } from '@/lib/types';

export async function listStaff(): Promise<AdminStaffListItem[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('staff')
    .select('id, staff_id, name, role, department, email, phone, joining_date')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    staffId: r.staff_id,
    name: r.name,
    role: r.role,
    department: r.department,
    email: r.email,
    phone: r.phone ?? undefined,
    joiningDate: r.joining_date,
  }));
}

export interface CreateStaffInput {
  staffId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  joiningDate: string; // ISO string
  qualifications?: string[];
  avatarUrl?: string;
}

export async function createStaff(input: CreateStaffInput): Promise<AdminStaffListItem> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const payload = {
    staff_id: input.staffId,
    name: input.name,
    role: input.role,
    department: input.department,
    email: input.email,
    phone: input.phone ?? null,
    joining_date: input.joiningDate,
    qualifications: input.qualifications ?? null,
    avatar_url: input.avatarUrl ?? null,
  };
  const { data, error } = await supabase
    .from('staff')
    .insert(payload)
    .select('id, staff_id, name, role, department, email, phone, joining_date')
    .single();
  if (error) throw error;
  return {
    id: String(data!.id),
    staffId: data!.staff_id,
    name: data!.name,
    role: data!.role,
    department: data!.department,
    email: data!.email,
    phone: data!.phone ?? undefined,
    joiningDate: data!.joining_date,
  };
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
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('staff')
    .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
    .eq('staff_id', staffId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
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
