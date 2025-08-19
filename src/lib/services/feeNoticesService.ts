"use client";

import { getSupabase } from "@/lib/supabaseClient";
import type { BulkFeeNoticeDefinition, BulkFeeNoticeFormValues, FeeNotice } from "@/lib/types";

// Assumed Supabase tables
// 1) public.fee_notice_batches
//    - id uuid pk default gen_random_uuid()
//    - notice_title text
//    - description text null
//    - amount numeric
//    - due_date date
//    - target_classes text
//    - additional_notes text null
//    - generated_date timestamptz default now()
//
// 2) public.student_fee_notices
//    - id uuid pk default gen_random_uuid()
//    - student_id text
//    - batch_id uuid references fee_notice_batches(id)
//    - title text
//    - description text null
//    - amount numeric
//    - due_date date
//    - status text check in ('Pending','Paid','Overdue')
//    - payment_link text null
//    - created_at timestamptz default now()

function mapBatchRowToDefinition(row: any): BulkFeeNoticeDefinition {
  return {
    id: String(row.id),
    noticeTitle: row.notice_title as string,
    description: row.description ?? undefined,
    amount: Number(row.amount),
    dueDate: row.due_date ? new Date(row.due_date) : new Date(),
    targetClasses: row.target_classes as string,
    additionalNotes: row.additional_notes ?? undefined,
    generatedDate: (row.generated_date ?? new Date().toISOString()) as string,
  };
}

function mapStudentNoticeRow(row: any): FeeNotice {
  return {
    id: String(row.id),
    title: row.title as string,
    description: row.description ?? undefined,
    amount: Number(row.amount),
    dueDate: row.due_date ? new Date(row.due_date).toISOString() : new Date().toISOString(),
    status: row.status as any,
    paymentLink: row.payment_link ?? undefined,
  };
}

export async function getAdminGeneratedFeeNotices(): Promise<BulkFeeNoticeDefinition[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("fee_notice_batches")
    .select("id, notice_title, description, amount, due_date, target_classes, additional_notes, generated_date")
    .order("generated_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBatchRowToDefinition);
}

export async function createAdminBulkFeeNotice(values: BulkFeeNoticeFormValues): Promise<BulkFeeNoticeDefinition> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = {
    notice_title: values.noticeTitle,
    description: values.description && values.description.length > 0 ? values.description : null,
    amount: values.amount,
    due_date: values.dueDate ? values.dueDate.toISOString().slice(0, 10) : null, // store as date
    target_classes: values.targetClasses,
    additional_notes: values.additionalNotes && values.additionalNotes.length > 0 ? values.additionalNotes : null,
  };
  const { data, error } = await supabase
    .from("fee_notice_batches")
    .insert(payload)
    .select("id, notice_title, description, amount, due_date, target_classes, additional_notes, generated_date")
    .single();
  if (error) throw error;
  const batch = mapBatchRowToDefinition(data);

  // Distribute to students: parse targetClasses lines and match against students.class_section
  try {
    const targetLines = (values.targetClasses || "")
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    // Fetch candidate students (optimize in DB with OR/ilike when needed)
    const { data: students, error: stuErr } = await supabase
      .from("students")
      .select("student_id, class_section");
    if (stuErr) throw stuErr;

    const matches = (students ?? []).filter((s: any) => {
      const cls = (s.class_section || "") as string;
      return targetLines.some(line => cls.toLowerCase().includes(line.toLowerCase()));
    });

    if (matches.length > 0) {
      const rows = matches.map((s: any) => ({
        student_id: s.student_id,
        batch_id: batch.id,
        title: values.noticeTitle,
        description: values.description && values.description.length > 0 ? values.description : null,
        amount: values.amount,
        due_date: values.dueDate ? values.dueDate.toISOString().slice(0, 10) : null,
        status: 'Pending',
        payment_link: null,
      }));
      // Bulk insert in chunks if needed
      const { error: insErr } = await supabase.from("student_fee_notices").insert(rows);
      if (insErr) throw insErr;
    }
  } catch (distErr) {
    // Non-fatal: batch created but distribution failed
    // eslint-disable-next-line no-console
    console.warn("Bulk distribution failed:", distErr);
  }

  return batch;
}

export async function getStudentFeeNotices(studentId: string): Promise<FeeNotice[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("student_fee_notices")
    .select("id, title, description, amount, due_date, status, payment_link")
    .eq("student_id", studentId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStudentNoticeRow);
}

export async function markFeeNoticePaid(noticeId: string): Promise<FeeNotice> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("student_fee_notices")
    .update({ status: "Paid" })
    .eq("id", noticeId)
    .select("id, title, description, amount, due_date, status, payment_link")
    .single();
  if (error) throw error;
  return mapStudentNoticeRow(data);
}

export async function getBatchDistributionStats(batchId: string): Promise<{ total: number; pending: number; paid: number; overdue: number; }>{
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("student_fee_notices")
    .select("status", { count: 'exact', head: false })
    .eq("batch_id", batchId);
  if (error) throw error;
  const total = data?.length ?? 0;
  const pending = (data ?? []).filter(r => r.status === 'Pending').length;
  const paid = (data ?? []).filter(r => r.status === 'Paid').length;
  const overdue = (data ?? []).filter(r => r.status === 'Overdue').length;
  return { total, pending, paid, overdue };
}
