'use client';

import { getSupabase } from '@/lib/supabaseClient';
import type { StudentProfile } from '@/lib/types';

export async function listStudents(): Promise<StudentProfile[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('students')
    .select('student_id, name, class_section, avatar_url, roll_no, parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    studentId: s.student_id as string,
    name: s.name as string,
    classSection: s.class_section as string,
    avatarUrl: s.avatar_url ?? undefined,
    rollNo: typeof s.roll_no === 'number' ? s.roll_no : undefined,
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
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('students')
    .select('student_id, name, class_section, avatar_url, roll_no, parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact')
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    studentId: data.student_id as string,
    name: data.name as string,
    classSection: data.class_section as string,
    avatarUrl: data.avatar_url ?? undefined,
    rollNo: typeof data.roll_no === 'number' ? data.roll_no : undefined,
    parentName: data.parent_name ?? undefined,
    parentContact: data.parent_contact ?? undefined,
    admissionNumber: data.admission_number ?? undefined,
    address: data.address ?? undefined,
    fatherName: data.father_name ?? undefined,
    motherName: data.mother_name ?? undefined,
    emergencyContact: data.emergency_contact ?? undefined,
  };
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
