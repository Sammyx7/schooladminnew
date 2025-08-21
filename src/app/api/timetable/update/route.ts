import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...rest } = body || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Only allow known fields
    const allowed: Record<string, any> = {};
    const fields = ['day_of_week','period','start_time','end_time','subject','class_name','section','teacher_staff_id','teacher_name','room'];
    for (const k of fields) {
      if (rest[k] !== undefined) allowed[k] = rest[k];
    }
    // Map legacy 'day' to canonical 'day_of_week' if provided
    if (rest['day'] !== undefined && allowed['day_of_week'] === undefined) {
      allowed['day_of_week'] = rest['day'];
    }

    const { data, error } = await supabase
      .from('timetable_entries')
      .update(allowed)
      .eq('id', id)
      .select('id, day:day_of_week, period, start_time, end_time, subject, class_name, section, teacher_staff_id, teacher_name, room')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ row: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
