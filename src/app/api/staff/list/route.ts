import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data, error } = await supabase
      .from('staff')
      .select('id, staff_id, name, role, department, email, phone, joining_date, qualifications, avatar_url')
      .order('staff_id', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Ensure sorting by numeric portion of staff_id in DESC order (e.g., TCH083 > TCH002 > TCH001)
    const getNum = (sid: any) => {
      const m = String(sid || '').match(/(\d+)/);
      return m ? parseInt(m[1], 10) : -Infinity;
    };
    const staffRows = (data ?? []).slice().sort((a: any, b: any) => getNum(b.staff_id) - getNum(a.staff_id));

    // If we have staff, load all assignments in one query and group by staff_id
    let assignmentsByStaffId: Record<string, any[]> = {};
    if (staffRows.length > 0) {
      const staffIds = staffRows.map((r: any) => r.staff_id);
      const { data: assigns, error: aerr } = await supabase
        .from('staff_class_assignments')
        .select('staff_id, class_name, section, subject, is_class_teacher')
        .in('staff_id', staffIds);
      if (aerr) {
        return NextResponse.json({ error: aerr.message }, { status: 400 });
      }
      (assigns ?? []).forEach((row: any) => {
        const key = row.staff_id;
        if (!assignmentsByStaffId[key]) assignmentsByStaffId[key] = [];
        assignmentsByStaffId[key].push(row);
      });
    }

    const mapped = staffRows.map((r: any) => ({
      id: String(r.id),
      staffId: r.staff_id,
      name: r.name,
      role: r.role,
      department: r.department,
      email: r.email,
      phone: r.phone ?? undefined,
      joiningDate: r.joining_date,
      qualifications: Array.isArray(r.qualifications) ? r.qualifications : undefined,
      avatarUrl: r.avatar_url ?? undefined,
      assignments: (assignmentsByStaffId[r.staff_id] || []).map((a: any) => ({
        className: a.class_name,
        section: a.section,
        subject: a.subject ?? undefined,
        isClassTeacher: !!a.is_class_teacher,
      })),
    }));

    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
