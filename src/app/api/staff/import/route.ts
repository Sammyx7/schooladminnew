import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Minimal CSV parser (same as students importer)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0, cur = '', inQuotes = false, row: string[] = [];
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(cur); cur = ''; i++; continue; }
      if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); rows.push(row); row = []; cur = ''; i++; continue;
      }
      cur += ch; i++; continue;
    }
  }
  row.push(cur); rows.push(row);
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided. Use multipart/form-data with field "file".' }, { status: 400 });
    }
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) return NextResponse.json({ error: 'Empty CSV.' }, { status: 400 });

    const headers = rows[0].map(normalizeHeader);
    const dataRows = rows.slice(1).filter(r => r.some(v => String(v).trim() !== ''));

    // Expected headers (flexible): staff_id, name, role, department, email
    // Optional: phone, joining_date (ISO or yyyy-mm-dd), qualifications (comma-separated), avatar_url
    const idx = (name: string, aliases: string[] = []) => {
      const all = [name, ...aliases].map(normalizeHeader);
      for (let a of all) { const j = headers.indexOf(a); if (j !== -1) return j; }
      return -1;
    };

    const iStaffId = idx('staff_id', ['id', 'staffid']);
    const iName = idx('name', ['full_name']);
    const iRole = idx('role', ['designation']);
    const iDept = idx('department', ['dept']);
    const iEmail = idx('email');
    const iPhone = idx('phone', ['mobile', 'contact']);
    const iJoining = idx('joining_date', ['date_of_joining', 'doj']);
    const iQual = idx('qualifications', ['qualification']);
    const iAvatar = idx('avatar_url', ['avatar', 'photo_url']);

    if (iStaffId === -1 || iName === -1 || iRole === -1 || iDept === -1 || iEmail === -1) {
      return NextResponse.json({ error: 'CSV must include: staff_id, name, role, department, email. Optional: phone, joining_date, qualifications, avatar_url.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload = dataRows.map((r) => ({
      staff_id: String(r[iStaffId] ?? '').trim(),
      name: String(r[iName] ?? '').trim(),
      role: String(r[iRole] ?? '').trim(),
      department: String(r[iDept] ?? '').trim(),
      email: String(r[iEmail] ?? '').trim(),
      phone: iPhone !== -1 ? (String(r[iPhone] ?? '').trim() || null) : null,
      joining_date: iJoining !== -1 ? (String(r[iJoining] ?? '').trim() || null) : null,
      qualifications: iQual !== -1 ? (String(r[iQual] ?? '').split(',').map(s=>s.trim()).filter(Boolean)) : [],
      avatar_url: iAvatar !== -1 ? (String(r[iAvatar] ?? '').trim() || null) : null,
    })).filter(x => x.staff_id && x.name && x.role && x.department && x.email);

    if (!payload.length) return NextResponse.json({ error: 'No valid rows found.' }, { status: 400 });

    const chunkSize = 500;
    let processed = 0;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('staff')
        .upsert(chunk, { onConflict: 'staff_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      processed += chunk.length;
    }

    return NextResponse.json({ ok: true, processed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
