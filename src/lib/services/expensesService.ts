"use client";

import { getSupabase } from "@/lib/supabaseClient";
import type { ExpenseRecord, ExpenseFormValues } from "@/lib/types";

// Table: public.expenses
// Columns (assumed):
// id uuid pk default gen_random_uuid(),
// date timestamptz not null,
// category text not null,
// description text not null,
// amount numeric not null,
// payment_method text null,
// created_at timestamptz default now()

function mapRowToExpense(row: any): ExpenseRecord {
  return {
    id: String(row.id),
    date: row.date ?? row.created_at ?? new Date().toISOString(),
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    paymentMethod: row.payment_method ?? undefined,
  };
}

export async function getAdminExpenseRecords(): Promise<ExpenseRecord[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("expenses")
    .select("id, date, category, description, amount, payment_method, created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRowToExpense);
}

export async function createAdminExpenseRecord(values: ExpenseFormValues): Promise<ExpenseRecord> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = {
    date: values.date.toISOString(),
    category: values.category,
    description: values.description,
    amount: Number(values.amount),
    payment_method: values.paymentMethod && values.paymentMethod.length > 0 ? values.paymentMethod : null,
  };
  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select("id, date, category, description, amount, payment_method, created_at")
    .single();
  if (error) throw error;
  return mapRowToExpense(data);
}

export async function updateAdminExpense(id: string, values: ExpenseFormValues): Promise<ExpenseRecord> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = {
    date: values.date.toISOString(),
    category: values.category,
    description: values.description,
    amount: Number(values.amount),
    payment_method: values.paymentMethod && values.paymentMethod.length > 0 ? values.paymentMethod : null,
  };
  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select("id, date, category, description, amount, payment_method, created_at")
    .single();
  if (error) throw error;
  return mapRowToExpense(data);
}

export async function deleteAdminExpense(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
