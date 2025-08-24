import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase
      .from('students')
      .select('student_id, name, class_section, avatar_url, roll_no, parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact');
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const list = (data ?? []).slice();
    const num = (id: string): number | null => {
      const m = String(id || '').match(/(\d+)/);
      return m ? Number(m[1]) : null;
    };
    list.sort((a: any, b: any) => {
      const an = num(a.student_id);
      const bn = num(b.student_id);
      if (an != null && bn != null) return bn - an; // descending numeric
      if (an != null) return 1;
      if (bn != null) return -1;
      const as = String(a.student_id || '').toLowerCase();
      const bs = String(b.student_id || '').toLowerCase();
      return bs.localeCompare(as); // descending lexicographic fallback
    });
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
