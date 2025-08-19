import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { idOrStaffId } = await req.json();
    if (!idOrStaffId) {
      return NextResponse.json({ error: 'idOrStaffId is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Try by id first
    let del = await supabase
      .from('staff')
      .delete()
      .eq('id', idOrStaffId)
      .select('id')
      .maybeSingle();

    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 400 });

    if (!del.data) {
      // fallback by staff_id
      del = await supabase
        .from('staff')
        .delete()
        .eq('staff_id', idOrStaffId)
        .select('id')
        .maybeSingle();
      if (del.error) return NextResponse.json({ error: del.error.message }, { status: 400 });
      if (!del.data) return NextResponse.json({ error: 'No matching staff found to delete.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
