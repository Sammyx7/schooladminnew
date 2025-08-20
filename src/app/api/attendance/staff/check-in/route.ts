import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Accepts { staffId: string, token: string }
// Validates token freshness and records a 'Present' attendance row for today if not already present.
export async function POST(req: Request) {
  try {
    const { staffId, token } = await req.json();
    if (!staffId || !token) {
      return NextResponse.json({ error: 'Missing staffId or token' }, { status: 400 });
    }
    // Normalize to uppercase to avoid case mismatches (e.g., "tch001" vs "TCH001")
    const normalizedStaffId = String(staffId).trim().toUpperCase();

    // Basic token validation: format `<uuid>.<base36Timestamp>`
    const parts = String(token).split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }
    const tsBase36 = parts[1];
    const issuedAtMs = parseInt(tsBase36, 36);
    if (!Number.isFinite(issuedAtMs)) {
      return NextResponse.json({ error: 'Invalid token timestamp' }, { status: 400 });
    }
    const ageMs = Date.now() - issuedAtMs;
    const MAX_AGE_MS = 2 * 60 * 1000; // 2 minutes TTL server-side
    if (ageMs < 0 || ageMs > MAX_AGE_MS) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Validate staff exists to avoid FK errors
    const { data: staffRow, error: staffLookupErr } = await supabase
      .from('staff')
      .select('staff_id')
      .eq('staff_id', normalizedStaffId)
      .maybeSingle();
    if (staffLookupErr) {
      return NextResponse.json({ error: staffLookupErr.message }, { status: 400 });
    }
    if (!staffRow) {
      return NextResponse.json({ error: `Staff ID not found: ${normalizedStaffId}. Please complete onboarding or use the correct ID.` }, { status: 404 });
    }

    // Prevent duplicate check-in for same staff/day
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const { data: existing, error: existingErr } = await supabase
      .from('staff_attendance')
      .select('id, date')
      .eq('staff_id', normalizedStaffId)
      .gte('date', start.toISOString())
      .lt('date', end.toISOString())
      .limit(1);
    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 400 });
    }
    if (existing && existing.length > 0) {
      return NextResponse.json({ message: 'Already checked in for today' }, { status: 200 });
    }

    const insertPayload = {
      staff_id: normalizedStaffId,
      date: new Date().toISOString(),
      status: 'Present',
    };

    const { error } = await supabase
      .from('staff_attendance')
      .insert(insertPayload);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Attendance recorded' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
