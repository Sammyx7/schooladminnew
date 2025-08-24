import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { staffId, title, description, severity, initialDeduction } = body || {};
    if (!staffId || !title || !severity) {
      return NextResponse.json({ error: 'staffId, title, severity required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await supabase
      .from('staff_complaints')
      .insert({ staff_id: staffId, title, description: description ?? null, severity, status: 'open' })
      .select('id, staff_id, title, description, severity, status, created_at, updated_at, resolved_at, resolution_notes, resolved_by')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Optional initial deduction
    if (initialDeduction && Number(initialDeduction) > 0) {
      await supabase.from('staff_rating_events').insert({
        staff_id: staffId,
        delta: -Math.abs(Number(initialDeduction)),
        reason: `Initial deduction for complaint: ${title}`,
        source: 'complaint_deduction',
        related_complaint_id: data.id,
      });
    }

    const payload = {
      id: String(data.id),
      staffId: data.staff_id,
      title: data.title,
      description: data.description ?? undefined,
      severity: data.severity,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
      resolutionNotes: data.resolution_notes,
      resolvedBy: data.resolved_by,
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
