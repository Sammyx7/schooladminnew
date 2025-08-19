import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdminClient';

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function staffEmail(staffId: string) {
  const domain = process.env.NEXT_PUBLIC_STAFF_LOGIN_DOMAIN || 'staff.local';
  return `${staffId}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const { staffId, name, password } = await request.json();
    if (!staffId || !name || !password) {
      return NextResponse.json({ error: 'staffId, name and password are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify staff exists and name matches
    const { data: staff, error: staffErr } = await supabase
      .from('staff')
      .select('id, name, auth_user_id')
      .eq('staff_id', staffId)
      .maybeSingle();
    if (staffErr) return NextResponse.json({ error: staffErr.message }, { status: 500 });
    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    if (normalizeName(staff.name) !== normalizeName(name)) {
      return NextResponse.json({ error: 'Name does not match' }, { status: 401 });
    }
    if (staff.auth_user_id) {
      return NextResponse.json({ error: 'Already registered' }, { status: 409 });
    }

    // Create auth user
    const email = staffEmail(staffId);
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { staffId, name },
    });
    if (createErr) {
      const msg = String((createErr as any)?.message || '');
      const status = (createErr as any)?.status ? Number((createErr as any).status) : 409;
      const looksExisting = status === 409 || status === 422 || /already/i.test(msg);

      if (looksExisting) {
        // Fetch existing user by the generated staff email
        let existingUser: any = null;
        try {
          if ((supabase as any).auth.admin.getUserByEmail) {
            const { data, error: getErr } = await (supabase as any).auth.admin.getUserByEmail(email);
            if (!getErr) {
              existingUser = (data && (data as any).user) ? (data as any).user : (data as any);
            }
          }
        } catch (_) {}

        if (!existingUser) {
          try {
            const { data: list, error: listErr } = await (supabase as any).auth.admin.listUsers();
            if (!listErr) {
              const users = (list as any)?.users ?? list;
              existingUser = Array.isArray(users)
                ? users.find((u: any) => String(u.email).toLowerCase() === String(email).toLowerCase())
                : null;
            }
          } catch (_) {}
        }

        if (!existingUser) {
          return NextResponse.json({ error: msg || 'User already exists', code: status }, { status });
        }

        // Update password
        const { error: updErr } = await (supabase as any).auth.admin.updateUserById(existingUser.id, { password });
        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

        // Link to staff
        const { error: updateErr } = await supabase
          .from('staff')
          .update({ auth_user_id: existingUser.id })
          .eq('staff_id', staffId);
        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

        return NextResponse.json({ ok: true, updated: true, linked: true });
      }

      return NextResponse.json({ error: msg || 'Create user failed', code: status }, { status });
    }

    const userId = created.user?.id;
    if (!userId) return NextResponse.json({ error: 'User creation failed' }, { status: 500 });

    // Link to staff
    const { error: updateErr } = await supabase
      .from('staff')
      .update({ auth_user_id: userId })
      .eq('staff_id', staffId);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
