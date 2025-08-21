import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      day: bodyDay,
      day_of_week: bodyDayOfWeek,
      period,
      start_time,
      end_time,
      subject,
      class_name,
      section,
      teacher_staff_id,
      teacher_name,
      room,
    } = body || {};
    const day = bodyDay ?? bodyDayOfWeek;

    if (!day || !period || !start_time || !end_time || !subject || !class_name || !section || !teacher_staff_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload: any = {
      day_of_week: day, // canonical column
      period,
      start_time,
      end_time,
      subject,
      class_name,
      section,
      teacher_staff_id,
      teacher_name: teacher_name ?? null,
      room: room ?? null,
    };

    const { data, error } = await supabase
      .from('timetable_entries')
      .insert(payload)
      .select('id, day:day_of_week, period, start_time, end_time, subject, class_name, section, teacher_staff_id, teacher_name, room')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ row: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
