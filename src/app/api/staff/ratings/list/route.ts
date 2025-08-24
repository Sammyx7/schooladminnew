import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const staffId = urlObj.searchParams.get('staffId')?.trim();
    const limit = Number(urlObj.searchParams.get('limit') || '20');
    if (!staffId) return NextResponse.json({ error: 'staffId required' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await supabase
      .from('staff_rating_events')
      .select('id, staff_id, delta, reason, source, related_complaint_id, created_by, created_at')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })
      .limit(Math.max(1, Math.min(100, limit)));

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const items = (data || []).map((r: any) => ({
      id: String(r.id),
      staffId: r.staff_id,
      delta: Number(r.delta),
      reason: r.reason,
      source: r.source,
      relatedComplaintId: r.related_complaint_id ?? null,
      createdBy: r.created_by ?? undefined,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
