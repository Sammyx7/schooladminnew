import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Minimal CSV parser that supports quoted fields and commas inside quotes
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0, cur = '', inQuotes = false, row: string[] = [];
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; } // Escaped quote
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(cur); cur = ''; i++; continue; }
      if (ch === '\n' || ch === '\r') {
        // consume \r\n as single line break
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); rows.push(row); row = []; cur = ''; i++; continue;
      }
      cur += ch; i++; continue;
    }
  }
  // push last cell/row
  row.push(cur); rows.push(row);
  // drop trailing empty line
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

    // Expected headers (flexible names allowed)
    // student_id, name, (class_section | class_name + section), roll_no, avatar_url,
    // parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact
    const idx = (name: string, aliases: string[] = []) => {
      const all = [name, ...aliases].map(normalizeHeader);
      for (let a of all) {
        const j = headers.indexOf(a);
        if (j !== -1) return j;
      }
      return -1;
    };

    const iStudentId = idx('student_id', ['id', 'studentid']);
    const iName = idx('name', ['full_name']);
    const iClassSection = idx('class_section', ['class&section', 'class_section', 'class', 'classsection']);
    const iClassName = idx('class_name', ['classname', 'class']);
    const iSection = idx('section', ['sec']);
    const iRollNo = idx('roll_no', ['rollno', 'roll_number']);
    const iAvatar = idx('avatar_url', ['avatar', 'photo_url']);
    const iParentName = idx('parent_name', ['guardian_name', 'parent', 'guardian']);
    const iParentContact = idx('parent_contact', ['parent_phone', 'guardian_phone', 'parent_contact_number', 'parent_mobile']);
    const iAdmissionNo = idx('admission_number', ['admission_no', 'admissionnumber', 'adm_no']);
    const iAddress = idx('address', ['addr', 'home_address']);
    const iFatherName = idx('father_name', ['fathers_name', 'father', 'fgathers_name']);
    const iMotherName = idx('mother_name', ['mothers_name', 'mother']);
    const iEmergency = idx('emergency_contact', ['emergency_phone', 'emergency_contact_number']);

    if (iStudentId === -1 || iName === -1 || (iClassSection === -1 && (iClassName === -1 || iSection === -1))) {
      return NextResponse.json({ error: 'CSV must include columns: student_id, name, and either class_section or (class_name + section). Optional: roll_no, avatar_url, parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload = dataRows.map((r) => {
      const classSectionVal = iClassSection !== -1
        ? String(r[iClassSection] ?? '').trim()
        : `${String(r[iClassName] ?? '').trim()}${String(r[iSection] ?? '').trim() ? ' - ' + String(r[iSection] ?? '').trim() : ''}`.trim();
      return {
        student_id: String(r[iStudentId] ?? '').trim(),
        name: String(r[iName] ?? '').trim(),
        class_section: classSectionVal,
        roll_no: iRollNo !== -1 ? (Number(String(r[iRollNo]).trim()) || null) : null,
        avatar_url: iAvatar !== -1 ? (String(r[iAvatar] ?? '').trim() || null) : null,
        parent_name: iParentName !== -1 ? (String(r[iParentName] ?? '').trim() || null) : null,
        parent_contact: iParentContact !== -1 ? (String(r[iParentContact] ?? '').trim() || null) : null,
        admission_number: iAdmissionNo !== -1 ? (String(r[iAdmissionNo] ?? '').trim() || null) : null,
        address: iAddress !== -1 ? (String(r[iAddress] ?? '').trim() || null) : null,
        father_name: iFatherName !== -1 ? (String(r[iFatherName] ?? '').trim() || null) : null,
        mother_name: iMotherName !== -1 ? (String(r[iMotherName] ?? '').trim() || null) : null,
        emergency_contact: iEmergency !== -1 ? (String(r[iEmergency] ?? '').trim() || null) : null,
      };
    }).filter(x => x.student_id && x.name && x.class_section);

    if (!payload.length) return NextResponse.json({ error: 'No valid rows found.' }, { status: 400 });

    // Upsert in chunks
    let inserted = 0;
    let updated = 0;
    const chunkSize = 500;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('students')
        .upsert(chunk, { onConflict: 'student_id' })
        .select('student_id');
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      inserted += chunk.length; // we don't differentiate here; simplistic count
    }

    return NextResponse.json({ ok: true, processed: payload.length, insertedOrUpdated: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
