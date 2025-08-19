"use client";

import { getSupabase } from "@/lib/supabaseClient";
import type { Circular, CreateCircularFormValues } from "@/lib/types";

// Table: public.circulars
// Columns (assumed):
// id uuid pk default gen_random_uuid(), title text, summary text,
// category text, attachment_link text null, created_at timestamptz default now()

function mapRowToCircular(row: any): Circular {
  return {
    id: String(row.id),
    title: row.title,
    summary: row.summary,
    category: row.category ?? undefined,
    attachmentLink: row.attachment_link ?? undefined,
    date: row.created_at ?? new Date().toISOString(),
  };
}

export async function getAdminCirculars(): Promise<Circular[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("circulars")
    .select("id, title, summary, category, attachment_link, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRowToCircular);
}

export async function createAdminCircular(values: CreateCircularFormValues): Promise<Circular> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = {
    title: values.title,
    summary: values.summary,
    category: values.category ?? null,
    attachment_link: values.attachmentLink && values.attachmentLink.length > 0 ? values.attachmentLink : null,
  };
  const { data, error } = await supabase
    .from("circulars")
    .insert(payload)
    .select("id, title, summary, category, attachment_link, created_at")
    .single();
  if (error) throw error;
  return mapRowToCircular(data);
}

export async function updateAdminCircular(id: string, values: CreateCircularFormValues): Promise<Circular> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload = {
    title: values.title,
    summary: values.summary,
    category: values.category ?? null,
    attachment_link: values.attachmentLink && values.attachmentLink.length > 0 ? values.attachmentLink : null,
  };
  const { data, error } = await supabase
    .from("circulars")
    .update(payload)
    .eq("id", id)
    .select("id, title, summary, category, attachment_link, created_at")
    .single();
  if (error) throw error;
  return mapRowToCircular(data);
}

export async function deleteAdminCircular(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("circulars").delete().eq("id", id);
  if (error) throw error;
}
