export type StaffAssignment = {
  className: string;
  section: string;
  subject?: string;
  isClassTeacher?: boolean;
};

export async function getAssignmentsForStaff(staffId: string): Promise<StaffAssignment[]> {
  const url = `/api/staff/assignments/list?staffId=${encodeURIComponent(staffId)}`;
  const res = await fetch(url, { method: 'GET' });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `List assignments failed with status ${res.status}`);
  }
  return payload as StaffAssignment[];
}

export async function setAssignmentsForStaff(staffId: string, assignments: StaffAssignment[]): Promise<{ ok: boolean }>{
  const res = await fetch('/api/staff/assignments/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, assignments }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Set assignments failed with status ${res.status}`);
  }
  return payload as { ok: boolean };
}

export async function getAssignmentOptions(): Promise<{ classes: string[]; sections: string[]; subjects: string[] }>{
  const res = await fetch('/api/staff/assignments/options', { method: 'GET' });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Options fetch failed with status ${res.status}`);
  }
  return payload as { classes: string[]; sections: string[]; subjects: string[] };
}
