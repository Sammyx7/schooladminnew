import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdminClient';

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export async function POST(request: Request) {
  try {
    const { staffId, name } = await request.json();
    if (!staffId || !name) {
      return NextResponse.json({ error: 'staffId and name are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, auth_user_id')
      .eq('staff_id', staffId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    if (normalizeName(data.name) !== normalizeName(name)) {
      return NextResponse.json({ error: 'Name does not match' }, { status: 401 });
    }

    const canRegister = !data.auth_user_id;
    return NextResponse.json({ ok: true, canRegister });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
