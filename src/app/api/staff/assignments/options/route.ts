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

    // 1) Read Settings (source of truth like onboarding form)
    const { data: settings, error: settingsErr } = await supabase
      .from('school_settings')
      .select('classes, sections, class_sections, subjects')
      .eq('id', 'singleton')
      .maybeSingle();
    if (settingsErr) return NextResponse.json({ error: settingsErr.message }, { status: 400 });

    // 2) Read existing assignments to supplement lists (optional)
    const { data: assignData, error: assignErr } = await supabase
      .from('staff_class_assignments')
      .select('class_name, section, subject');
    if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 400 });

    const fromAssignClasses = new Set<string>();
    const fromAssignSections = new Set<string>();
    const fromAssignSubjects = new Set<string>();
    for (const r of assignData || []) {
      if (r.class_name) fromAssignClasses.add(String(r.class_name).trim());
      if (r.section) fromAssignSections.add(String(r.section).trim());
      if (r.subject) fromAssignSubjects.add(String(r.subject).trim());
    }

    // Build classes list from settings.classes (ordered). If missing, fall back to distinct from assignments.
    const classes: string[] = Array.isArray(settings?.classes) && settings!.classes.length > 0
      ? settings!.classes.filter(Boolean)
      : Array.from(fromAssignClasses);

    // Build sections: if class_sections present, take union of all values; else use settings.sections; else from assignments.
    let sections: string[] = [];
    if (settings?.class_sections && typeof settings.class_sections === 'object') {
      const union = new Set<string>();
      for (const key of Object.keys(settings.class_sections as Record<string, string[]>)) {
        const arr = (settings.class_sections as Record<string, string[]>)[key] || [];
        for (const s of arr) if (s) union.add(String(s).trim());
      }
      sections = Array.from(union);
    } else if (Array.isArray(settings?.sections)) {
      sections = settings!.sections.filter(Boolean);
    } else {
      sections = Array.from(fromAssignSections);
    }

    // Subjects: prefer settings.subjects; fall back to distinct from assignments.
    const subjects: string[] = Array.isArray(settings?.subjects) && settings!.subjects.length > 0
      ? settings!.subjects.filter(Boolean)
      : Array.from(fromAssignSubjects);

    const payload = {
      classes: classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      sections: sections.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      subjects: subjects.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
