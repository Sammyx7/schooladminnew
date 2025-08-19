import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Returns distinct lists of classes, sections, and subjects seen so far.
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await supabase
      .from('staff_class_assignments')
      .select('class_name, section, subject');

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const classesSet = new Set<string>();
    const sectionsSet = new Set<string>();
    const subjectsSet = new Set<string>();

    for (const r of data || []) {
      if (r.class_name) classesSet.add(String(r.class_name).trim());
      if (r.section) sectionsSet.add(String(r.section).trim());
      if (r.subject) subjectsSet.add(String(r.subject).trim());
    }

    const payload = {
      classes: Array.from(classesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      sections: Array.from(sectionsSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      subjects: Array.from(subjectsSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
