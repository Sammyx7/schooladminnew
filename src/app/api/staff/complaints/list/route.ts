import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const staffId = u.searchParams.get('staffId')?.trim() || undefined;
    const status = u.searchParams.get('status')?.trim() || undefined;
    const severity = u.searchParams.get('severity')?.trim() || undefined;
    const q = u.searchParams.get('q')?.trim() || undefined;
    const limit = Math.max(1, Math.min(200, Number(u.searchParams.get('limit') || '50')));

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    let query = supabase
      .from('staff_complaints')
      .select('id, staff_id, title, description, severity, status, created_at, updated_at, resolved_at, resolution_notes, resolved_by')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (staffId) query = query.eq('staff_id', staffId);
    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (q) query = query.ilike('title', `%${q}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const items = (data || []).map((r: any) => ({
      id: String(r.id),
      staffId: r.staff_id,
      title: r.title,
      description: r.description ?? undefined,
      severity: r.severity,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      resolvedAt: r.resolved_at,
      resolutionNotes: r.resolution_notes,
      resolvedBy: r.resolved_by,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
