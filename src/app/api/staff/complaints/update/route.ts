import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, updates } = body || {};
    if (!id || !updates) return NextResponse.json({ error: 'id and updates required' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Handle rewardDelta by inserting a rating_event
    if (typeof updates.rewardDelta === 'number' && updates.rewardDelta !== 0) {
      const complaint = await supabase
        .from('staff_complaints')
        .select('id, staff_id, title')
        .eq('id', id)
        .single();
      if (complaint.error) return NextResponse.json({ error: complaint.error.message }, { status: 400 });
      await supabase.from('staff_rating_events').insert({
        staff_id: complaint.data.staff_id,
        delta: Number(updates.rewardDelta),
        reason: `Reward for complaint resolution: ${complaint.data.title}`,
        source: 'complaint_resolution',
        related_complaint_id: complaint.data.id,
      });
    }

    const patch: any = {};
    if (updates.status) patch.status = updates.status;
    if ('resolutionNotes' in updates) patch.resolution_notes = updates.resolutionNotes;

    if (Object.keys(patch).length > 0) {
      const { data, error } = await supabase
        .from('staff_complaints')
        .update(patch)
        .eq('id', id)
        .select('id, staff_id, title, description, severity, status, created_at, updated_at, resolved_at, resolution_notes, resolved_by')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
    }

    // If only rewardDelta was processed, return the current complaint
    const { data, error } = await supabase
      .from('staff_complaints')
      .select('id, staff_id, title, description, severity, status, created_at, updated_at, resolved_at, resolution_notes, resolved_by')
      .eq('id', id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
