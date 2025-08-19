import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { schoolName, sections, classes, classSections, classSubjects, subjects, address, phone, email, logoUrl } = body || {};

    if (!schoolName) {
      return NextResponse.json({ error: 'schoolName is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Upsert singleton row with id = 'singleton'
    const payload: any = {
      id: 'singleton',
      school_name: schoolName,
      sections: Array.isArray(sections) ? sections : null,
      // new structure
      classes: Array.isArray(classes) ? classes : null,
      class_sections: classSections && typeof classSections === 'object' ? classSections : null,
      class_subjects: classSubjects && typeof classSubjects === 'object' ? classSubjects : null,
      subjects: Array.isArray(subjects) ? subjects : null,
      address: address ?? null,
      phone: phone ?? null,
      email: email ?? null,
      logo_url: logoUrl ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('school_settings')
      .upsert(payload, { onConflict: 'id' })
      .select('id, school_name, sections, classes, class_sections, class_subjects, subjects, address, phone, email, logo_url, updated_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      schoolName: data!.school_name,
      sections: data!.sections ?? [],
      classes: data!.classes ?? [],
      classSections: data!.class_sections ?? {},
      classSubjects: data!.class_subjects ?? {},
      subjects: data!.subjects ?? [],
      address: data!.address ?? '',
      phone: data!.phone ?? '',
      email: data!.email ?? '',
      logoUrl: data!.logo_url ?? '',
      updatedAt: data!.updated_at,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
