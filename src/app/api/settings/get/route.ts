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
      .from('school_settings')
      .select('id, school_name, sections, classes, class_sections, class_subjects, subjects, address, phone, email, logo_url, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      // Sensible defaults when no row yet
      return NextResponse.json({
        schoolName: '',
        classMin: undefined,
        classMax: undefined,
        sections: ['A', 'B', 'C'],
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
        updatedAt: null,
      });
    }

    return NextResponse.json({
      schoolName: data.school_name ?? '',
      classMin: undefined,
      classMax: undefined,
      sections: Array.isArray(data.sections) ? data.sections : [],
      classes: Array.isArray(data.classes) ? data.classes : [],
      classSections: typeof data.class_sections === 'object' && data.class_sections !== null ? data.class_sections : {},
      classSubjects: typeof data.class_subjects === 'object' && data.class_subjects !== null ? data.class_subjects : {},
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      logoUrl: data.logo_url ?? '',
      updatedAt: data.updated_at ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
