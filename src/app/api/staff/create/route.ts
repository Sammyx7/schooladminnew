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
      salary,
      qualifications,
      avatarUrl,
      assignments,
    } = body || {};

    if (!name || !role || !department || !email || !joiningDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // If staffId not provided, generate next based on latest staff_id
    let finalStaffId: string = staffId;
    if (!finalStaffId) {
      const { data: last, error: lastErr } = await supabase
        .from('staff')
        .select('staff_id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      const prev = last?.staff_id || '';
      finalStaffId = nextStaffId(prev);
    }

    const payload: any = {
      staff_id: finalStaffId,
      name,
      role,
      department,
      email,
      phone: phone ?? null,
      joining_date: joiningDate,
      salary: salary === undefined || salary === null || salary === '' ? null : Number(salary),
      qualifications: qualifications ?? null,
      avatar_url: avatarUrl ?? null,
    };

    const { data, error } = await supabase
      .from('staff')
      .insert(payload)
      .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url, salary')
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
            salary: data!.salary === null || data!.salary === undefined ? undefined : Number(data!.salary),
            qualifications: Array.isArray(data!.qualifications) ? data!.qualifications : [],
            avatarUrl: data!.avatar_url ?? undefined,
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
      salary: data!.salary === null || data!.salary === undefined ? undefined : Number(data!.salary),
      qualifications: Array.isArray(data!.qualifications) ? data!.qualifications : [],
      avatarUrl: data!.avatar_url ?? undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

function nextStaffId(prev: string | undefined | null): string {
  const base = (prev || '').trim();
  // Default start when no previous ID exists -> TCH001
  if (!base) return 'TCH001';
  const m = base.match(/^([A-Za-z-]*?)(\d+)$/);
  // If previous doesn't match pattern, fall back to default start
  if (!m) return 'TCH001';
  const prefix = m[1] || 'TCH';
  const numStr = m[2];
  const next = (parseInt(numStr, 10) + 1).toString().padStart(numStr.length || 3, '0');
  return `${prefix}${next}`;
}
