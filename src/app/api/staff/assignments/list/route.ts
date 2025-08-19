import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const staffIdRaw = urlObj.searchParams.get('staffId');
    const staffId = staffIdRaw ? staffIdRaw.trim() : '';
    if (!staffId) return NextResponse.json({ error: 'staffId is required' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await supabase
      .from('staff_class_assignments')
      .select('class_name, section, subject, is_class_teacher')
      .ilike('staff_id', staffId)
      .order('class_name', { ascending: true })
      .order('section', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const payload = (data || []).map((r) => ({
      className: r.class_name,
      section: r.section,
      subject: r.subject ?? undefined,
      isClassTeacher: !!r.is_class_teacher,
    }));

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
