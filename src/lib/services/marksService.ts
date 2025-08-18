"use client";

import { getSupabase } from "@/lib/supabaseClient";

export interface StudentLite {
  studentId: string;
  name: string;
}

export interface MarkRecordLite {
  student_id: string;
  marks: number | null;
  remarks: string | null;
  max_marks: number | null;
}

export interface MarksFilter {
  class: string;
  section: string;
  subject: string;
  term: string;
}

export interface UpsertMarksInput extends MarksFilter {
  maxMarks: number;
  rows: Array<{ studentId: string; marks?: number; remarks?: string }>;
}

export async function getStudentsByClassSection(
  klass: string,
  section: string
): Promise<StudentLite[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const classSection = `${klass} - ${section}`;
  const { data, error } = await supabase
    .from("students")
    .select("student_id, name")
    .eq("class_section", classSection)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((d) => ({ studentId: d.student_id, name: d.name }));
}

export async function getMarksForFilters(
  filter: MarksFilter
): Promise<MarkRecordLite[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("marks")
    .select("student_id, marks, remarks, max_marks")
    .eq("class", filter.class)
    .eq("section", filter.section)
    .eq("subject", filter.subject)
    .eq("term", filter.term);
  if (error) throw error;
  return (data ?? []) as MarkRecordLite[];
}

export async function upsertMarksBatch(input: UpsertMarksInput): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload = input.rows.map((r) => ({
    student_id: r.studentId,
    class: input.class,
    section: input.section,
    subject: input.subject,
    term: input.term,
    max_marks: input.maxMarks,
    marks: r.marks ?? null,
    remarks: r.remarks ?? null,
  }));

  if (payload.length === 0) return;

  const { error } = await supabase
    .from("marks")
    .upsert(payload, { onConflict: "student_id,class,section,subject,term" });
  if (error) throw error;
}
