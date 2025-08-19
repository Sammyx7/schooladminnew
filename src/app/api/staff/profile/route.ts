import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const staffIdRaw = urlObj.searchParams.get('staffId');
    const emailRaw = urlObj.searchParams.get('email');
    const staffId = staffIdRaw ? staffIdRaw.trim() : null;
    const email = emailRaw ? emailRaw.trim() : null;

    if (!staffId && !email) {
      return NextResponse.json({ error: 'staffId or email is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    let data: any = null;
    let error: any = null;
    if (staffId) {
      const res = await supabase
        .from('staff')
        .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
        .ilike('staff_id', staffId)
        .maybeSingle();
      data = res.data; error = res.error;
    } else if (email) {
      const res = await supabase
        .from('staff')
        .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
        .ilike('email', email)
        .maybeSingle();
      data = res.data; error = res.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(null, { status: 200 });
    }

    const payload = {
      id: String(data.id),
      staffId: data.staff_id,
      name: data.name,
      role: data.role,
      department: data.department,
      email: data.email,
      phone: data.phone ?? '',
      dateOfJoining: data.joining_date,
      qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
      avatarUrl: data.avatar_url ?? undefined,
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
