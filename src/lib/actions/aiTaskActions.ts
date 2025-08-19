"use server";

import { z } from "zod";
import { updateSchoolSettings, getSchoolSettings } from "@/lib/services/settingsService";

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  }

async function updateStaffFieldsSecure(staffId: string, updates: { role?: string; department?: string; email?: string; phone?: string | null; joiningDate?: string; }): Promise<AdminTaskResult> {
  const res = await fetch(`${getBaseUrl()}/api/staff/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, updates }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: payload?.error || `Staff update failed (${res.status})` };
  return { ok: true, message: `Staff ${staffId} updated.`, details: payload };
}
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

// Result type
export type AdminTaskResult = {
  ok: boolean;
  message: string;
  details?: any;
};

// Public entry point: perform a task described in natural language or JSON.
export async function performAdminTask(input: { command: string }): Promise<AdminTaskResult> {
  const text = (input?.command || "").trim();
  if (!text) return { ok: false, message: "Command is empty." };

  // Try JSON first for reliability
  try {
    const maybeJson = JSON.parse(text);
    if (maybeJson && typeof maybeJson === "object") {
      return handleStructuredCommand(maybeJson);
    }
  } catch (_) {
    // not JSON, proceed with NL parse
  }

  // Simple NL intent detection (fully local, no external LLM)
  const lc = text.toLowerCase();

  // Update staff ID command e.g. "update Shayan Ahmed staff id to TCH101" or "update staff TCH100 id to TCH101"
  if (/update\s+.*staff\s*id\s*to\s+/i.test(text) || /update\s+staff\s+.*\s+id\s*to\s+/i.test(text)) {
    const newIdMatch = text.match(/to\s+([A-Za-z-]*\d+)/i);
    const newStaffId = newIdMatch ? newIdMatch[1] : undefined;
    // Try capture current staff id directly
    const curIdMatch = text.match(/staff\s+([A-Za-z-]*\d+)/i);
    let currentId = curIdMatch ? curIdMatch[1] : undefined;
    // Or capture a name
    let name: string | undefined;
    if (!currentId) {
      // primary pattern
      let nm = (text.match(/update\s+([^,\n]+?)\s+staff\s*id\s*to\s+/i)?.[1]) || undefined;
      // fallback broader capture between 'update' and 'staff id to'
      if (!nm) nm = (text.match(/update\s+(.+?)\s+staff\s*id\s*to\s+/i)?.[1]) || undefined;
      if (nm) {
        nm = nm.replace(/[’']s$/i, '').trim(); // drop possessive 's
        name = sanitizePersonName(nm);
      }
    }
    if (!newStaffId) return { ok: false, message: 'Missing target staff ID.' };
    if (!currentId && !name) return { ok: false, message: 'Provide current staff ID or a staff name.' };
    if (!currentId && name) {
      const found = await findStaffIdByName(name);
      if (!found) return { ok: false, message: `Could not find staff named ${name}.` };
      currentId = found;
    }
    return updateStaffIdSecure(currentId!, newStaffId);
  }

  // Update staff fields (role, department, email, phone, joining date)
  // Examples:
  //  - "update shayan role to sports teacher"
  //  - "update staff ST-123 role to Teacher"
  //  - "change shayan department to science"
  //  - "set shayan email to a@b.com"
  //  - "update shayan phone to 9999"
  //  - "update shayan joining date to 2024-06-01"
  if (/(update|change|set)\s+.+\s+(role|department|email|phone|(joining\s*date|doj|join))\s+to\s+/i.test(text)) {
    // field detection
    const fieldMatch = text.match(/\b(role|department|email|phone|joining\s*date|doj|join)\b/i);
    const fieldRaw = fieldMatch ? fieldMatch[1].toLowerCase() : '';
    const valueMatch = text.match(/\b(?:to)\s+([^\n]+)$/i);
    const rawValue = valueMatch ? valueMatch[1].trim() : '';
    // identify staff (by id or name)
    const idMatch = text.match(/staff\s+([A-Za-z-]*\d+)/i);
    let staffId = idMatch ? idMatch[1] : undefined;
    let name: string | undefined;
    if (!staffId) {
      // extract between the verb and the field keyword
      const who = text.match(/(?:update|change|set)\s+(.+?)\s+(?:role|department|email|phone|joining\s*date|doj|join)\s+to\s+/i)?.[1];
      if (who) name = sanitizePersonName(who.replace(/[’']s$/i, '').trim());
    }
    if (!rawValue) return { ok: false, message: 'Missing new value.' };
    if (!staffId && name) {
      const found = await findStaffIdByName(name);
      if (!found) return { ok: false, message: `Could not find staff named ${name}.` };
      staffId = found;
    }
    if (!staffId) return { ok: false, message: 'Provide a staff name or staff ID.' };

    const updates: any = {};
    if (fieldRaw.startsWith('role')) updates.role = sanitizeWord(rawValue);
    else if (fieldRaw.startsWith('department')) updates.department = sanitizeDepartment(rawValue);
    else if (fieldRaw.startsWith('email')) updates.email = rawValue.trim();
    else if (fieldRaw.startsWith('phone')) updates.phone = rawValue.replace(/[^0-9+\- ]/g, '').trim();
    else updates.joiningDate = rawValue.trim();

    return updateStaffFieldsSecure(staffId, updates);
  }

  if (/(add|create)\s+class/.test(lc)) {
    // e.g. "add class Class 10 with sections A,B and subjects Math, Science"
    const classNameMatch = text.match(/class\s+([^,\n]+?)(\s+with|\s*,|$)/i);
    const sectionsMatch = text.match(/sections?\s+([a-z0-9 ,.-]+)/i);
    const subjectsMatch = text.match(/subjects?\s+([a-z0-9 ,.-]+)/i);
    const className = classNameMatch ? classNameMatch[1].trim() : undefined;
    const sections = sectionsMatch ? sectionsMatch[1].split(/[, ]+/).map(s=>s.trim()).filter(Boolean) : [];
    const subjects = subjectsMatch ? subjectsMatch[1].split(/[, ]+/).map(s=>s.trim()).filter(Boolean) : [];
    if (!className) return { ok: false, message: "Could not detect class name. Try: Add class Class 10 with sections A,B and subjects Math,Science" };
    return addClassBundle({ name: className, sections, subjects });
  }

  if (/(add|create)\s+staff/.test(lc)) {
    // Minimal extract
    // e.g. "add staff John Doe role Teacher department Science email john@x.com phone 9999 joining 2024-06-01"
    const nameRaw = pickAfter(text, /staff\s+/i) || pickAfter(text, /name\s+/i);
    const roleRaw = pickAfter(text, /role\s+/i);
    const deptRaw = pickAfter(text, /department\s+/i) || "General";
    const name = nameRaw ? sanitizePersonName(nameRaw) : undefined;
    const role = roleRaw ? sanitizeWord(roleRaw) : undefined;
    const department = sanitizeDepartment(deptRaw);
    const email = pickAfter(text, /email\s+/i);
    const phone = pickAfter(text, /phone\s+/i);
    const joiningDate = pickAfter(text, /(joining|doj|join)\s+/i) || new Date().toISOString().slice(0,10);
    if (!name || !role || !email) return { ok: false, message: "Need at least name, role and email for staff." };
    const staffId = `ST-${Date.now()}`;
    return createStaffSecure({ staffId, name, role, department, email, phone, joiningDate });
  }

  if (/(add|create)\s+student/.test(lc)) {
    // e.g. "add student Ali Khan class Class 5 - A"
    const name = pickAfter(text, /student\s+/i) || pickAfter(text, /name\s+/i);
    const classSection = pickAfter(text, /(class|section|class\s*section)\s+/i);
    if (!name || !classSection) return { ok: false, message: "Need student name and class/section (e.g., Class 5 - A)." };
    const studentId = `STU-${Date.now()}`;
    return createStudentSecure({ studentId, name, classSection });
  }

  return { ok: false, message: "Sorry, I couldn't understand the task. Provide JSON or use commands like: Add class Class 10 with sections A,B and subjects Math,Science | Add staff John Doe role Teacher department Science email john@x.com | Add student Ali Khan class Class 5 - A" };
}

// ---------- Structured handler ----------
const AddClassSchema = z.object({ name: z.string(), sections: z.array(z.string()).optional(), subjects: z.array(z.string()).optional() });
const AddStaffSchema = z.object({ staffId: z.string().optional(), name: z.string(), role: z.string(), department: z.string().default("General"), email: z.string(), phone: z.string().optional(), joiningDate: z.string().optional() });
const AddStudentSchema = z.object({ studentId: z.string().optional(), name: z.string(), classSection: z.string() });
const UpdateStaffIdSchema = z.object({ currentId: z.string().optional(), name: z.string().optional(), newStaffId: z.string() });

async function handleStructuredCommand(obj: any): Promise<AdminTaskResult> {
  // Supports shapes like { addClass: { ... } }, { addStaff: { ... } }, { addStudent: { ... } }
  if (obj.addClass) return addClassBundle(AddClassSchema.parse(obj.addClass));
  if (obj.addStaff) {
    const v = AddStaffSchema.parse(obj.addStaff);
    return createStaffSecure({
      staffId: v.staffId || `ST-${Date.now()}`,
      name: v.name,
      role: v.role,
      department: v.department,
      email: v.email,
      phone: v.phone,
      joiningDate: v.joiningDate || new Date().toISOString().slice(0,10),
    });
  }
  if (obj.addStudent) {
    const v = AddStudentSchema.parse(obj.addStudent);
    return createStudentSecure({
      studentId: v.studentId || `STU-${Date.now()}`,
      name: v.name,
      classSection: v.classSection,
    });
  }
  // Flexible alternatives: { action: "addStaff", staff: {...} } or top-level fields
  if (typeof obj.action === 'string') {
    const a = String(obj.action).toLowerCase();
    if (a === 'addstaff' || a === 'create_staff' || a === 'add_staff' || a === 'staff_create') {
      const merged = { ...(obj.staff || {}), ...(obj) };
      const v = AddStaffSchema.parse({
        staffId: merged.staffId,
        name: merged.name,
        role: merged.role,
        department: merged.department || merged.dept || 'General',
        email: merged.email,
        phone: merged.phone,
        joiningDate: merged.joiningDate,
      });
      return createStaffSecure({
        staffId: v.staffId || `ST-${Date.now()}`,
        name: v.name,
        role: v.role,
        department: v.department,
        email: v.email,
        phone: v.phone,
        joiningDate: v.joiningDate || new Date().toISOString().slice(0,10),
      });
    }
    if (a === 'addstudent' || a === 'create_student' || a === 'add_student' || a === 'student_create') {
      const merged = { ...(obj.student || {}), ...(obj) };
      const v = AddStudentSchema.parse({
        studentId: merged.studentId,
        name: merged.name,
        classSection: merged.classSection || merged.class || merged.section,
      });
      return createStudentSecure({
        studentId: v.studentId || `STU-${Date.now()}`,
        name: v.name,
        classSection: v.classSection,
      });
    }
    if (a === 'addclass' || a === 'create_class' || a === 'add_class' || a === 'class_create') {
      const merged = { ...(obj.class || {}), ...(obj) };
      const v = AddClassSchema.parse({
        name: merged.name || merged.className,
        sections: merged.sections,
        subjects: merged.subjects,
      });
      return addClassBundle(v);
    }
    if (a === 'updatestaffid' || a === 'update_staff_id' || a === 'change_staff_id') {
      const merged = { ...(obj.staff || {}), ...(obj) };
      const v = UpdateStaffIdSchema.parse({ currentId: merged.currentId || merged.staffId, name: merged.name, newStaffId: merged.newStaffId });
      let cur = v.currentId;
      if (!cur && v.name) cur = await findStaffIdByName(v.name);
      if (!cur) return { ok: false, message: 'Current staff not found for update.' };
      return updateStaffIdSecure(cur, v.newStaffId);
    }
  }
  // Direct object with current/new id
  if ((obj.currentId || obj.staffId) && obj.newStaffId) {
    const cur = String(obj.currentId || obj.staffId);
    return updateStaffIdSecure(cur, String(obj.newStaffId));
  }
  // Heuristic: if it looks like staff fields at top level
  if (obj.name && obj.role && obj.email && (obj.action === undefined)) {
    const v = AddStaffSchema.parse({
      staffId: obj.staffId,
      name: obj.name,
      role: obj.role,
      department: obj.department || 'General',
      email: obj.email,
      phone: obj.phone,
      joiningDate: obj.joiningDate,
    });
    return createStaffSecure({
      staffId: v.staffId || `ST-${Date.now()}`,
      name: v.name,
      role: v.role,
      department: v.department,
      email: v.email,
      phone: v.phone,
      joiningDate: v.joiningDate || new Date().toISOString().slice(0,10),
    });
  }
  return { ok: false, message: "Unsupported structured command. Use addClass/addStaff/addStudent or action-based forms." };
}

// ---------- Executors (server-only, service-role API where needed) ----------
async function addClassBundle(params: { name: string; sections?: string[]; subjects?: string[]; }): Promise<AdminTaskResult> {
  const current = await getSchoolSettings();
  const classes = new Set<string>(current?.classes || []);
  classes.add(params.name);
  const classSections = { ...(current?.classSections || {}) } as Record<string,string[]>;
  if (params.sections && params.sections.length) classSections[params.name] = Array.from(new Set(params.sections));
  const classSubjects = { ...(current?.classSubjects || {}) } as Record<string,string[]>;
  if (params.subjects && params.subjects.length) classSubjects[params.name] = Array.from(new Set(params.subjects));

  const next = await updateSchoolSettings({
    schoolName: current?.schoolName || "",
    classes: Array.from(classes),
    classSections,
    classSubjects,
    // keep other existing settings
    sections: current?.sections,
    subjects: current?.subjects,
    classMin: current?.classMin,
    classMax: current?.classMax,
    address: current?.address,
    phone: current?.phone,
    email: current?.email,
    logoUrl: current?.logoUrl,
  });
  return { ok: true, message: `Added/updated class ${params.name}.`, details: next };
}

async function createStaffSecure(params: { staffId: string; name: string; role: string; department: string; email: string; phone?: string; joiningDate: string; }): Promise<AdminTaskResult> {
  const res = await fetch(`${getBaseUrl()}/api/staff/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const payload = await res.json().catch(()=>({}));
  if (!res.ok) return { ok: false, message: payload?.error || `Staff create failed (${res.status})` };
  return { ok: true, message: `Staff ${params.name} created.`, details: payload };
}

async function createStudentSecure(params: { studentId: string; name: string; classSection: string; avatarUrl?: string | null; }): Promise<AdminTaskResult> {
  const res = await fetch(`${getBaseUrl()}/api/students/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const payload = await res.json().catch(()=>({}));
  if (!res.ok) return { ok: false, message: payload?.error || `Student create failed (${res.status})` };
  return { ok: true, message: `Student ${params.name} created.`, details: payload };
}

// Update staff ID securely via server API
async function updateStaffIdSecure(currentId: string, newStaffId: string): Promise<AdminTaskResult> {
  const res = await fetch(`${getBaseUrl()}/api/staff/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId: currentId, updates: { staffIdNew: newStaffId } }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: payload?.error || `Staff update failed (${res.status})` };
  return { ok: true, message: `Staff ID updated: ${currentId} → ${newStaffId}`, details: payload };
}

// Server-side list of staff (minimal fields)
async function listStaffServer(): Promise<{ staffId: string; name: string }[]> {
  const res = await fetch(`${getBaseUrl()}/api/staff/list`, { method: 'GET', cache: 'no-store' });
  if (!res.ok) return [];
  const payload = await res.json().catch(() => ([]));
  if (!Array.isArray(payload)) return [];
  return payload.map((r: any) => ({ staffId: r.staffId || r.staff_id, name: r.name }));
}

// Resolve staffId by exact or partial name match
async function findStaffIdByName(name: string): Promise<string | undefined> {
  const list = await listStaffServer();
  const n = name.trim().toLowerCase();
  const exact = list.find(i => (i.name || '').trim().toLowerCase() === n);
  if (exact) return exact.staffId;
  const partial = list.find(i => (i.name || '').toLowerCase().includes(n));
  return partial?.staffId;
}

// ---------- helpers ----------
function pickAfter(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  if (!m) return undefined;
  const start = (m.index || 0) + m[0].length;
  // take until next known keyword
  const tail = text.slice(start).trim();
  const stop = tail.search(/\b(role|department|email|phone|joining|class|section|subjects?|with|and|&)\b/i);
  const chunk = stop >= 0 ? tail.slice(0, stop) : tail;
  return chunk.replace(/[,:]/g, "").trim();
}

function sanitizePersonName(s: string): string {
  let x = s.trim();
  // remove common prefixes/titles
  x = x.replace(/^\b(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|sir|madam|member|teacher)\b\s+/i, "");
  // collapse spaces
  x = x.replace(/\s+/g, " ").trim();
  // cut trailing connectors
  x = x.replace(/\b(and|with|of|&)$/i, "").trim();
  return x;
}

function sanitizeWord(s: string): string {
  return s.replace(/[,:]/g, "").replace(/\b(and|with|of|&)$/i, "").trim();
}

function sanitizeDepartment(s: string): string {
  let x = sanitizeWord(s);
  // simple titlecase for nicer display
  x = x.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return x || 'General';
}
