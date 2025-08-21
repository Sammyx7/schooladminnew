import type { DayOfWeek, TimetableEntry } from '@/lib/types';

// DB row shape returned from API
export type TimetableDbRow = {
  id: string;
  day: DayOfWeek;
  period: number;
  start_time: string; // 'HH:MM:SS'
  end_time: string;   // 'HH:MM:SS'
  subject: string;
  class_name: string;
  section: string;
  teacher_staff_id: string;
  teacher_name?: string | null;
  room?: string | null;
};

export type ListTimetableFilters = {
  day?: DayOfWeek;
  class?: string;
  section?: string;
  teacherStaffId?: string;
};

export async function listTimetable(filters: ListTimetableFilters = {}): Promise<TimetableEntry[]> {
  const params = new URLSearchParams();
  if (filters.day) params.set('day', String(filters.day));
  if (filters.class) params.set('class', String(filters.class));
  if (filters.section) params.set('section', String(filters.section));
  if (filters.teacherStaffId) params.set('teacherStaffId', String(filters.teacherStaffId));

  const res = await fetch(`/api/timetable/list?${params.toString()}`, { cache: 'no-store' });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Failed to load timetable');
  const rows = payload.rows as TimetableDbRow[];
  return rows.map(mapDbRowToEntry);
}

export type CreateTimetableInput = {
  day: DayOfWeek;
  period: number;
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  subject: string;
  class: string;
  section: string;
  teacherStaffId: string;
  teacherName?: string;
  room?: string;
};

export async function createTimetableEntry(input: CreateTimetableInput): Promise<TimetableEntry> {
  const res = await fetch(`/api/timetable/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      day_of_week: input.day,            // canonical column
      period: input.period,
      start_time: ensureSeconds(input.startTime),
      end_time: ensureSeconds(input.endTime),
      subject: input.subject,
      class_name: input.class,
      section: input.section,
      teacher_staff_id: input.teacherStaffId,
      teacher_name: input.teacherName ?? null,
      room: input.room ?? null,
    }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Failed to create timetable entry');
  return mapDbRowToEntry(payload.row as TimetableDbRow);
}

export type UpdateTimetablePatch = Partial<CreateTimetableInput> & { id: string };

export async function updateTimetableEntry(patch: UpdateTimetablePatch): Promise<TimetableEntry> {
  const res = await fetch(`/api/timetable/update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: patch.id,
      day_of_week: patch.day,            // canonical column
      period: patch.period,
      start_time: patch.startTime ? ensureSeconds(patch.startTime) : undefined,
      end_time: patch.endTime ? ensureSeconds(patch.endTime) : undefined,
      subject: patch.subject,
      class_name: patch.class,
      section: patch.section,
      teacher_staff_id: patch.teacherStaffId,
      teacher_name: patch.teacherName,
      room: patch.room,
    }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Failed to update timetable entry');
  return mapDbRowToEntry(payload.row as TimetableDbRow);
}

export async function deleteTimetableEntry(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/timetable/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || 'Failed to delete timetable entry');
  return { id: String(payload.id) };
}

function ensureSeconds(hhmm: string): string {
  // Normalize 'HH:MM' => 'HH:MM:00' and pass-through if already has seconds
  if (/^\d{2}:\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  if (/^\d{1,2}:\d{2}$/.test(hhmm)) {
    const [h, m] = hhmm.split(':');
    const hh = String(h).padStart(2, '0');
    return `${hh}:${m}:00`;
  }
  return hhmm;
}

function timeRangeFromDb(start: string, end: string): string {
  // Convert 'HH:MM:SS' -> 'HH:MM - HH:MM'
  const s = start.substring(0, 5);
  const e = end.substring(0, 5);
  return `${s} - ${e}`;
}

function mapDbRowToEntry(row: TimetableDbRow): TimetableEntry {
  return {
    id: row.id,
    day: row.day,
    period: row.period,
    timeSlot: timeRangeFromDb(row.start_time, row.end_time),
    subject: row.subject,
    teacher: row.teacher_name || row.teacher_staff_id,
    class: row.class_name,
    section: row.section,
  };
}
