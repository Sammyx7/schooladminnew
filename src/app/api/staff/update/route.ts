import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { staffId, updates } = await req.json();
    if (!staffId || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload: any = {};
    if (updates.staffIdNew !== undefined) payload.staff_id = updates.staffIdNew;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.joiningDate !== undefined) payload.joining_date = updates.joiningDate;
    if (updates.salary !== undefined) payload.salary = updates.salary === '' ? null : Number(updates.salary);
    if (updates.qualifications !== undefined) payload.qualifications = updates.qualifications;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('staff')
      .update(payload)
      .eq('staff_id', staffId)
      .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url, salary')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: String(data!.id),
      staffId: data!.staff_id,
      name: data!.name,
      role: data!.role,
      department: data!.department,
      email: data!.email,
      phone: data!.phone ?? undefined,
      joiningDate: data!.joining_date,
      salary: data!.salary === null || data!.salary === undefined ? undefined : Number(data!.salary),
      qualifications: Array.isArray(data!.qualifications) ? data!.qualifications : [],
      avatarUrl: data!.avatar_url ?? undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
