import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      .select('id, staff_id, name, auth_user_id')
      .eq('staff_id', staffId)
      .maybeSingle();

    if (staffErr) {
      return NextResponse.json({ error: staffErr.message }, { status: 400 });
    }
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Case-insensitive name match
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

    // 3) Use a generated login email based on staffId (only for Auth identity)
    const domain = process.env.NEXT_PUBLIC_STAFF_LOGIN_DOMAIN || 'staff.local';
    const loginEmail = `${staff.staff_id}@${domain}`;

    // Try to find existing auth user by generated email
    let authUserId: string | null = null;
    try {
      if ((supabase as any).auth.admin.getUserByEmail) {
        const { data, error: getErr } = await (supabase as any).auth.admin.getUserByEmail(loginEmail);
        if (!getErr) {
          const user = (data && (data as any).user) ? (data as any).user : (data as any);
          if (user && user.id) authUserId = user.id;
        }
      }
    } catch (_) {}
    // Fallback to listUsers if getUserByEmail isn't available
    if (!authUserId) {
      try {
        const { data: list, error: listErr } = await (supabase as any).auth.admin.listUsers();
        if (!listErr) {
          const users = (list as any)?.users ?? list;
          const found = Array.isArray(users)
            ? users.find((u: any) => String(u.email).toLowerCase() === String(loginEmail).toLowerCase())
            : null;
          authUserId = found?.id || null;
        }
      } catch (_) {}
    }

    if (authUserId) {
      // Update password and link
      const { error: updErr2 } = await (supabase as any).auth.admin.updateUserById(authUserId, { password });
      if (updErr2) return NextResponse.json({ error: updErr2.message }, { status: 400 });

      const { error: linkErr2 } = await supabase
        .from('staff')
        .update({ auth_user_id: authUserId })
        .eq('id', staff.id);
      if (linkErr2) return NextResponse.json({ error: linkErr2.message }, { status: 400 });

      return NextResponse.json({ ok: true, updated: true, linked: true });
    }

    // Not found: create the auth user with the generated email
    const { data: created, error: createErr } = await (supabase as any).auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: { staffId: staff.staff_id, name: staff.name },
    });

    if (createErr) {
      // Resolve 409 by fetching existing user, updating password and linking
      const msg = String((createErr as any)?.message || '');
      const status = (createErr as any)?.status ? Number((createErr as any).status) : 409;
      const looksExisting = status === 409 || status === 422 || /already/i.test(msg);
      if (looksExisting) {
        // Ensure we have the user id
        if (!authUserId) {
          try {
            if ((supabase as any).auth.admin.getUserByEmail) {
              const { data, error: getErr } = await (supabase as any).auth.admin.getUserByEmail(loginEmail);
              if (!getErr) {
                const user = (data && (data as any).user) ? (data as any).user : (data as any);
                if (user && user.id) authUserId = user.id;
              }
            }
          } catch (_) {}
          if (!authUserId) {
            try {
              const { data: list, error: listErr } = await (supabase as any).auth.admin.listUsers();
              if (!listErr) {
                const users = (list as any)?.users ?? list;
                const found = Array.isArray(users)
                  ? users.find((u: any) => String(u.email).toLowerCase() === String(loginEmail).toLowerCase())
                  : null;
                authUserId = found?.id || null;
              }
            } catch (_) {}
          }
        }
        if (!authUserId) {
          return NextResponse.json({ error: msg || 'User already exists', code: status }, { status });
        }
        const { error: updErr3 } = await (supabase as any).auth.admin.updateUserById(authUserId, { password });
        if (updErr3) return NextResponse.json({ error: updErr3.message }, { status: 400 });
        const { error: linkErr3 } = await supabase
          .from('staff')
          .update({ auth_user_id: authUserId })
          .eq('id', staff.id);
        if (linkErr3) return NextResponse.json({ error: linkErr3.message }, { status: 400 });
        return NextResponse.json({ ok: true, updated: true, linked: true });
      }
      return NextResponse.json({ error: msg || 'Create user failed', code: status }, { status });
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
