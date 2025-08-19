import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, name, classSection, avatarUrl, rollNo, parentName, parentContact, admissionNumber, address, fatherName, motherName, emergencyContact } = body || {};

    if (!studentId || !name || !classSection) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase service credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const payload: any = {
      student_id: studentId,
      name,
      class_section: classSection,
      avatar_url: avatarUrl ?? null,
      roll_no: typeof rollNo === 'number' ? rollNo : null,
      parent_name: parentName ?? null,
      parent_contact: parentContact ?? null,
      admission_number: admissionNumber ?? null,
      address: address ?? null,
      father_name: fatherName ?? null,
      mother_name: motherName ?? null,
      emergency_contact: emergencyContact ?? null,
    };

    const { data, error } = await supabase
      .from('students')
      .insert(payload)
      .select('student_id, name, class_section, avatar_url, roll_no, parent_name, parent_contact, admission_number, address, father_name, mother_name, emergency_contact')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      studentId: data!.student_id as string,
      name: data!.name as string,
      classSection: data!.class_section as string,
      avatarUrl: data!.avatar_url ?? undefined,
      rollNo: typeof data!.roll_no === 'number' ? data!.roll_no : undefined,
      parentName: data!.parent_name ?? undefined,
      parentContact: data!.parent_contact ?? undefined,
      admissionNumber: data!.admission_number ?? undefined,
      address: data!.address ?? undefined,
      fatherName: data!.father_name ?? undefined,
      motherName: data!.mother_name ?? undefined,
      emergencyContact: data!.emergency_contact ?? undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
