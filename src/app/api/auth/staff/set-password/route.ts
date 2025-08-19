import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server route: Verify staffId + name, then set password for linked auth user.
// If no auth link exists, create the auth user with staff.email, confirm email, set password, and store auth_user_id.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { staffId, name, password } = body || {};

    if (!staffId || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields: staffId, name, password' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // 1) Verify staff exists and name matches
    const { data: staff, error: staffErr } = await supabase
      .from('staff')
      .select('id, staff_id, name, email, auth_user_id')
      .eq('staff_id', staffId)
      .maybeSingle();

    if (staffErr) {
      return NextResponse.json({ error: staffErr.message }, { status: 400 });
    }
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Case-insensitive compare for safety
    const namesMatch = String(staff.name).trim().toLowerCase() === String(name).trim().toLowerCase();
    if (!namesMatch) {
      return NextResponse.json({ error: 'Provided name does not match staff record' }, { status: 400 });
    }

    // 2) If already linked to an auth user, update password by user id
    if (staff.auth_user_id) {
      const { error: updErr } = await (supabase as any).auth.admin.updateUserById(staff.auth_user_id, { password });
      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true, updated: true, linked: true });
    }

    // 3) Not linked yet — attempt to create the auth user using staff.email
    if (!staff.email) {
      return NextResponse.json({ error: 'Staff record has no email to create an Auth user' }, { status: 400 });
    }

    // Try to create user; email confirmed so they can log in immediately
    const { data: created, error: createErr } = await (supabase as any).auth.admin.createUser({
      email: staff.email,
      password,
      email_confirm: true,
      user_metadata: { staffId: staff.staff_id, name: staff.name },
    });

    if (createErr) {
      // Most common: user already registered. We surface a clear 409.
      return NextResponse.json({ error: createErr.message, code: createErr.status || 409 }, { status: 409 });
    }

    // 4) Save the linkage back to staff.auth_user_id
    const { error: linkErr } = await supabase
      .from('staff')
      .update({ auth_user_id: created.user?.id || created.id })
      .eq('id', staff.id);

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, created: true, linked: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
