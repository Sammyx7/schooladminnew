import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const staffIdRaw: string | undefined = body?.staffId;
    const assignments: any[] = Array.isArray(body?.assignments) ? body.assignments : [];
    const staffId = staffIdRaw ? String(staffIdRaw).trim() : '';
    if (!staffId || !Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Canonicalize staffId from staff table (case-insensitive match)
    let canonicalStaffId = staffId;
    {
      const { data: staffRow, error: staffErr } = await supabase
        .from('staff')
        .select('staff_id')
        .ilike('staff_id', staffId)
        .maybeSingle();
      if (!staffErr && staffRow?.staff_id) {
        canonicalStaffId = staffRow.staff_id as string;
      }
    }

    // Delete existing assignments for this staff (case-insensitive): select IDs then delete
    {
      const { data: existing, error: selErr } = await supabase
        .from('staff_class_assignments')
        .select('id')
        .ilike('staff_id', canonicalStaffId);
      if (selErr) return NextResponse.json({ error: selErr.message }, { status: 400 });
      const ids = (existing || []).map((r: any) => r.id).filter(Boolean);
      if (ids.length > 0) {
        const { error: delErr } = await supabase
          .from('staff_class_assignments')
          .delete()
          .in('id', ids);
        if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });
      }
    }

    const rows = assignments
      .filter((a: any) => a && a.className && a.section)
      .map((a: any) => ({
        staff_id: canonicalStaffId,
        class_name: String(a.className).trim(),
        section: String(a.section).trim(),
        subject: typeof a.subject === 'string' ? a.subject.trim() : a.subject ?? null,
        is_class_teacher: !!a.isClassTeacher,
      }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase
        .from('staff_class_assignments')
        .insert(rows);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
