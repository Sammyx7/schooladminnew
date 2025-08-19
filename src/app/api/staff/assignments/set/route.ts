import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { staffId, assignments } = body || {};
    if (!staffId || !Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Upsert strategy: delete existing for staffId then insert new set (simple and safe for small N)
    const { error: delErr } = await supabase
      .from('staff_class_assignments')
      .delete()
      .eq('staff_id', staffId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

    const rows = assignments
      .filter((a: any) => a && a.className && a.section)
      .map((a: any) => ({
        staff_id: staffId,
        class_name: String(a.className),
        section: String(a.section),
        subject: a.subject ?? null,
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
