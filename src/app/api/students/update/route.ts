import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { studentId, updates } = await req.json();
    if (!studentId || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.classSection !== undefined) payload.class_section = updates.classSection;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('student_id', studentId)
      .select('student_id, name, class_section, avatar_url')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      studentId: data!.student_id as string,
      name: data!.name as string,
      classSection: data!.class_section as string,
      avatarUrl: data!.avatar_url ?? undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
