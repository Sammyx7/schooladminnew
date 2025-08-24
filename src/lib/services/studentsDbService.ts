'use client';

import { getSupabase } from '@/lib/supabaseClient';
import type { StudentProfile } from '@/lib/types';

export async function listStudents(): Promise<StudentProfile[]> {
  const res = await fetch('/api/students/list', { cache: 'no-store' });
  const payload = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(payload?.error || `Failed to list students (${res.status})`);
  const data = Array.isArray(payload) ? payload : [];
  return data.map((s: any) => ({
    studentId: s.student_id as string,
    name: s.name as string,
    classSection: s.class_section as string,
    avatarUrl: s.avatar_url ?? undefined,
    rollNo: typeof s.roll_no === 'number' ? s.roll_no : (s.roll_no == null ? undefined : Number(s.roll_no)),
    parentName: s.parent_name ?? undefined,
    parentContact: s.parent_contact ?? undefined,
    admissionNumber: s.admission_number ?? undefined,
    address: s.address ?? undefined,
    fatherName: s.father_name ?? undefined,
    motherName: s.mother_name ?? undefined,
    emergencyContact: s.emergency_contact ?? undefined,
  }));
}

export async function getStudentByStudentId(studentId: string): Promise<StudentProfile | null> {
  const url = `/api/students/get?student_id=${encodeURIComponent(studentId)}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Failed to fetch student (${res.status})`);
  if (!data) return null;
  return {
    studentId: data.student_id as string,
    name: data.name as string,
    classSection: data.class_section as string,
    avatarUrl: data.avatar_url ?? undefined,
    rollNo: typeof data.roll_no === 'number' ? data.roll_no : (data.roll_no == null ? undefined : Number(data.roll_no)),
    parentName: data.parent_name ?? undefined,
    parentContact: data.parent_contact ?? undefined,
    admissionNumber: data.admission_number ?? undefined,
    address: data.address ?? undefined,
    fatherName: data.father_name ?? undefined,
    motherName: data.mother_name ?? undefined,
    emergencyContact: data.emergency_contact ?? undefined,
  };
}

export async function deleteStudents(studentIds: string[]): Promise<{ ok: true; deleted: number }> {
  const res = await fetch('/api/students/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentIds }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || `Failed to delete students (${res.status})`);
  }
  return payload as { ok: true; deleted: number };
}

export interface UpdateStudentInput {
  name?: string;
  classSection?: string;
  avatarUrl?: string | null;
  rollNo?: number | null;
  parentName?: string | null;
  parentContact?: string | null;
  admissionNumber?: string | null;
  address?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  emergencyContact?: string | null;
}

export async function updateStudent(studentId: string, updates: UpdateStudentInput): Promise<StudentProfile> {
  // Use server API route to perform update with service role (bypasses RLS for admin actions)
  const res = await fetch('/api/students/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, updates }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Update failed with status ${res.status}`);
  }
  return payload as StudentProfile;
}
