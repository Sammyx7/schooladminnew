import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { staffId, delta, reason, relatedComplaintId } = body || {};
    if (!staffId || typeof delta !== 'number' || !reason) {
      return NextResponse.json({ error: 'staffId, delta, reason are required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { error } = await supabase.from('staff_rating_events').insert({
      staff_id: staffId,
      delta,
      reason,
      source: 'manual',
      related_complaint_id: relatedComplaintId ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
