"use client";

import { getSupabase } from "@/lib/supabaseClient";
import type { StaffAttendanceRecord } from "@/lib/types";
import { getStaffProfileByStaffId } from "@/lib/services/staffDbService";

// Fetch staff's own attendance history from Supabase if configured, otherwise fall back to mocks
export async function getStaffOwnAttendanceHistoryDb(staffId: string): Promise<StaffAttendanceRecord[]> {
  const supabase = getSupabase();
  if (!supabase) {
    const { getStaffOwnAttendanceHistory } = await import("@/lib/services/staffService");
    return getStaffOwnAttendanceHistory(staffId);
  }

  const { data, error } = await supabase
    .from("staff_attendance")
    .select("id, staff_id, date, status")
    .eq("staff_id", staffId)
    .order("date", { ascending: false });
  if (error) throw error;

  // Enrich with profile (name/department) for type completeness
  const profile = await getStaffProfileByStaffId(staffId).catch(() => null);
  const staffName = profile?.name ?? "";
  const department = profile?.department ?? "";

  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    staffId: r.staff_id,
    staffName,
    department,
    date: r.date ?? new Date().toISOString(),
    status: r.status,
  }));
}

// Call server API to mark attendance via a QR token
export async function markAttendanceViaToken(staffId: string, token: string): Promise<{ ok: boolean; message: string }>{
  try {
    const res = await fetch("/api/attendance/staff/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, token }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || "Check-in failed");
    }
    return { ok: true, message: payload.message || "Checked in" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Check-in failed" };
  }
}
