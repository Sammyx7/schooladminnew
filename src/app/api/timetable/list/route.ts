import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day') || undefined;
    const className = searchParams.get('class') || undefined;
    const section = searchParams.get('section') || undefined;
    const teacherStaffId = searchParams.get('teacherStaffId') || undefined;

    let q = supabase
      .from('timetable_entries')
      .select('id, day, period, start_time, end_time, subject, class_name, section, teacher_staff_id, teacher_name, room')
      .order('day', { ascending: true })
      .order('period', { ascending: true });

    if (day) q = q.eq('day', day);
    if (className) q = q.eq('class_name', className);
    if (section) q = q.eq('section', section);
    if (teacherStaffId) q = q.eq('teacher_staff_id', teacherStaffId);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ rows: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
