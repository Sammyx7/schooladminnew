import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      staffId,
      name,
      role,
      department,
      email,
      phone,
      joiningDate,
      qualifications,
      avatarUrl,
      assignments,
    } = body || {};

    if (!staffId || !name || !role || !department || !email || !joiningDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload: any = {
      staff_id: staffId,
      name,
      role,
      department,
      email,
      phone: phone ?? null,
      joining_date: joiningDate,
      qualifications: qualifications ?? null,
      avatar_url: avatarUrl ?? null,
    };

    const { data, error } = await supabase
      .from('staff')
      .insert(payload)
      .select('id, staff_id, name, role, department, email, phone, joining_date')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Optionally insert assignments if provided
    if (Array.isArray(assignments) && assignments.length > 0) {
      const rows = assignments
        .filter((a: any) => a && a.className && a.section)
        .map((a: any) => ({
          staff_id: data!.staff_id,
          class_name: String(a.className),
          section: String(a.section),
          subject: a.subject ?? null,
          is_class_teacher: !!a.isClassTeacher,
        }));
      if (rows.length > 0) {
        const { error: aErr } = await supabase
          .from('staff_class_assignments')
          .insert(rows);
        // If the table doesn't exist or violates constraints, surface a soft error message for visibility
        if (aErr) {
          // Do not fail the whole staff creation; return warning embedded
          return NextResponse.json({
            id: String(data!.id),
            staffId: data!.staff_id,
            name: data!.name,
            role: data!.role,
            department: data!.department,
            email: data!.email,
            phone: data!.phone ?? undefined,
            joiningDate: data!.joining_date,
            _assignmentsWarning: aErr.message,
          });
        }
      }
    }

    return NextResponse.json({
      id: String(data!.id),
      staffId: data!.staff_id,
      name: data!.name,
      role: data!.role,
      department: data!.department,
      email: data!.email,
      phone: data!.phone ?? undefined,
      joiningDate: data!.joining_date,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
