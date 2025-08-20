import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/attendance/staff/list
// Body: { departmentFilter?: string; staffNameOrIdFilter?: string; dateFilter?: string | null }
// Returns: StaffAttendanceRecord[] with joined staff name/department
export async function POST(req: Request) {
  try {
    const { departmentFilter = '', staffNameOrIdFilter = '', dateFilter } = await req.json().catch(() => ({}));

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    let query = supabase
      .from('staff_attendance')
      .select('id, staff_id, date, status, staff(name, department)')
      .order('date', { ascending: false });

    if (dateFilter) {
      const d = new Date(dateFilter);
      if (!isNaN(d.getTime())) {
        const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
        const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0));
        query = query.gte('date', start.toISOString()).lt('date', end.toISOString());
      }
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    type Row = { id: string | number; staff_id: string; date: string; status: string; staff?: { name?: string; department?: string } };
    let mapped = (data || []).map((r: Row) => ({
      id: String(r.id),
      staffId: r.staff_id,
      staffName: r.staff?.name ?? '',
      department: r.staff?.department ?? '',
      date: r.date,
      status: r.status,
    }));

    // Client-side filters applied on server to reduce payload
    if (departmentFilter) {
      const term = String(departmentFilter).toLowerCase();
      mapped = mapped.filter(r => r.department.toLowerCase().includes(term));
    }
    if (staffNameOrIdFilter) {
      const term = String(staffNameOrIdFilter).toLowerCase();
      mapped = mapped.filter(r => r.staffName.toLowerCase().includes(term) || r.staffId.toLowerCase().includes(term));
    }

    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
