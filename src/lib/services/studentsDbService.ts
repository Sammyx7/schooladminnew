'use client';

import { getSupabase } from '@/lib/supabaseClient';
import type { StudentProfile } from '@/lib/types';

export async function listStudents(): Promise<StudentProfile[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('students')
    .select('student_id, name, class_section, avatar_url')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    studentId: s.student_id as string,
    name: s.name as string,
    classSection: s.class_section as string,
    avatarUrl: s.avatar_url ?? undefined,
  }));
}

export async function getStudentByStudentId(studentId: string): Promise<StudentProfile | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('students')
    .select('student_id, name, class_section, avatar_url')
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    studentId: data.student_id as string,
    name: data.name as string,
    classSection: data.class_section as string,
    avatarUrl: data.avatar_url ?? undefined,
  };
}

export interface UpdateStudentInput {
  name?: string;
  classSection?: string;
  avatarUrl?: string | null;
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
