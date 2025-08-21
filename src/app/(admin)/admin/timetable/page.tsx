
"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays, Loader2, AlertCircle as AlertIcon, Info, Filter, Download, PlusCircle, Edit, RotateCcw, ClipboardList, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimetableEntry, DayOfWeek, AdminTimetableFilterFormValues, AdminStaffListItem } from '@/lib/types';
import { AdminTimetableFilterSchema } from '@/lib/types';
import { listTimetable, createTimetableEntry, updateTimetableEntry } from '@/lib/services/timetableService';
import { listStaff } from '@/lib/services/staffDbService';
import { useToast } from '@/hooks/use-toast';
import { getSchoolSettings, listClasses, sectionsForClass, listSubjects, subjectsForClass } from '@/lib/services/settingsService';
import type { SchoolSettings } from '@/lib/services/settingsService';

// Use a const tuple to satisfy z.enum and keep strong typing
const dayEnumValues = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type DayLiteral = typeof dayEnumValues[number];
const daysOfWeek: DayLiteral[] = [...dayEnumValues];

const groupTimetableByDay = (entries: TimetableEntry[]): Record<DayOfWeek, TimetableEntry[]> => {
  const grouped = {} as Record<DayOfWeek, TimetableEntry[]>;
  daysOfWeek.forEach(day => grouped[day] = []);
  entries.forEach(entry => grouped[entry.day]?.push(entry));
  for (const day in grouped) {
    grouped[day as DayOfWeek].sort((a, b) => a.period - b.period);
  }
  return grouped;
};

// Form schema for Add/Edit Timetable Entry
const TimetableEntryFormSchema = z.object({
  day: z.enum(dayEnumValues),
  period: z.coerce.number().int().positive({ message: 'Period must be a positive integer.' }),
  timeSlot: z.string().min(3, { message: 'Time slot is required.' }),
  subject: z.string().min(2, { message: 'Subject is required.' }),
  teacher: z.string().min(2, { message: 'Teacher is required.' }),
  class: z.string().optional().or(z.literal('')),
  section: z.string().optional().or(z.literal('')),
});
type TimetableEntryFormValues = z.infer<typeof TimetableEntryFormSchema>;

// Bulk builder schema
const BulkBuilderSchema = z.object({
  className: z.string().min(1, 'Class is required'),
  section: z.string().optional().or(z.literal('')),
  days: z.array(z.enum(dayEnumValues)).min(1, 'Pick at least one day'),
  mode: z.enum(['hours', 'count']).default('hours'),
  startTime: z.string().min(3),
  // if hours mode
  endTime: z.string().optional(),
  // if count mode
  periodCount: z.coerce.number().int().positive().optional(),
  // common
  periodMinutes: z.coerce.number().int().positive(),
  lunchAfter: z.coerce.number().int().min(0).optional(),
  lunchMinutes: z.coerce.number().int().min(0).optional(),
  defaultTeacher: z.string().optional(),
});
type BulkBuilderValues = z.infer<typeof BulkBuilderSchema>;

const DayTimetableSkeleton = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[10%]"><Skeleton className="h-5 w-12" /></TableHead>
        <TableHead className="w-[20%]"><Skeleton className="h-5 w-24" /></TableHead>
        <TableHead className="w-[25%]"><Skeleton className="h-5 w-32" /></TableHead>
        <TableHead className="w-[20%]"><Skeleton className="h-5 w-24" /></TableHead>
        <TableHead className="w-[25%]"><Skeleton className="h-5 w-32" /></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function AdminTimetablePage() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [staff, setStaff] = useState<AdminStaffListItem[]>([]);
  const { toast } = useToast();
  const [classOptions, setClassOptions] = useState<string[]>([]);
  // Bulk dialog state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const bulkForm = useForm<BulkBuilderValues>({
    resolver: zodResolver(BulkBuilderSchema),
    defaultValues: {
      className: '',
      section: '',
      days: [],
      mode: 'hours',
      startTime: '08:00',
      endTime: '13:00',
      periodMinutes: 45,
      lunchAfter: 4,
      lunchMinutes: 30,
      defaultTeacher: '',
    },
  });
  type BulkRow = { period: number; start: string; end: string; subject: string; teacher: string };
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  const form = useForm<AdminTimetableFilterFormValues>({
    resolver: zodResolver(AdminTimetableFilterSchema),
    defaultValues: { classFilter: '', sectionFilter: '', teacherFilter: '' },
  });

  const fetchTimetable = async (filters?: AdminTimetableFilterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Map teacher filter (name) -> staffId if available
      let teacherStaffId: string | undefined = undefined;
      if (filters?.teacherFilter) {
        const byName = staff.find(s => s.name === filters.teacherFilter);
        if (byName) teacherStaffId = byName.staffId;
      }
      const data = await listTimetable({
        class: filters?.classFilter || undefined,
        section: filters?.sectionFilter || undefined,
        teacherStaffId,
      });
      setTimetableEntries(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching timetable.";
      setError(msg);
      toast({ title: "Error Fetching Timetable", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ==== Bulk builder helpers ====
  const toMinutes = (t: string): number => {
    const [hh, mm] = t.split(':').map((x) => parseInt(x, 10));
    return (hh % 24) * 60 + (mm % 60);
  };
  const fromMinutes = (m: number): string => {
    const mm = ((m % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hhPart = Math.floor(mm / 60);
    const minPart = mm % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hhPart)}:${pad(minPart)}`;
  };
  const generateBulkRows = (
    startTime: string,
    endTime: string | undefined,
    periodMinutes: number,
    periodCount?: number,
    lunchAfter?: number,
    lunchMinutes?: number
  ): { start: string; end: string }[] => {
    if (!startTime || !periodMinutes || periodMinutes <= 0) throw new Error('Start time and positive period duration are required');
    const rows: { start: string; end: string }[] = [];
    const start = toMinutes(startTime);
    const hasLunch = !!lunchAfter && lunchAfter > 0 && !!lunchMinutes && lunchMinutes > 0;
    if (endTime) {
      const end = toMinutes(endTime);
      let curStart = start;
      let idx = 0;
      while (curStart + periodMinutes <= end) {
        idx += 1;
        // insert lunch if configured and this would be the first period after lunchAfter
        if (hasLunch && lunchAfter && idx === lunchAfter + 1) {
          curStart += lunchMinutes!;
        }
        const curEnd = curStart + periodMinutes;
        if (curEnd > end) break;
        rows.push({ start: fromMinutes(curStart), end: fromMinutes(curEnd) });
        curStart = curEnd;
      }
    } else if (periodCount && periodCount > 0) {
      let curStart = start;
      for (let i = 1; i <= periodCount; i++) {
        if (hasLunch && lunchAfter && i === lunchAfter + 1) {
          curStart += lunchMinutes!;
        }
        const curEnd = curStart + periodMinutes;
        rows.push({ start: fromMinutes(curStart), end: fromMinutes(curEnd) });
        curStart = curEnd;
      }
    } else {
      throw new Error('Either end time or period count must be provided');
    }
    return rows;
  };

  // Bulk builder local ops
  const normalizeRowsByTime = (rows: BulkRow[]) => {
    const withStartMins = rows.map(r => ({ ...r, __m: toMinutes(r.start) }));
    withStartMins.sort((a, b) => a.__m - b.__m);
    return withStartMins.map((r, i) => ({ period: i + 1, start: r.start, end: r.end, subject: r.subject, teacher: r.teacher }));
  };
  const editRow = (index: number, patch: Partial<BulkRow>) => {
    setBulkRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const moveRow = (index: number, dir: -1 | 1) => {
    setBulkRows((prev) => {
      const next = prev.slice();
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      // keep manual order, renumber, then align times to the new order (preserve each row's duration)
      const renumbered = next.map((r, i) => ({ ...r, period: i + 1 }));
      return alignTimesToOrder(renumbered);
    });
  };

  // Adjust times to follow the current row order, preserving each row's duration
  const alignTimesToOrder = (rows: BulkRow[]): BulkRow[] => {
    if (rows.length === 0) return rows;
    // compute durations; fall back to periodMinutes if any invalid
    const defaultDur = Number(bulkForm.getValues('periodMinutes')) || 45;
    const durations = rows.map(r => {
      const d = toMinutes(r.end) - toMinutes(r.start);
      return Number.isFinite(d) && d > 0 ? d : defaultDur;
    });
    // start from the first row's current start time
    let cursor = toMinutes(rows[0].start);
    const aligned: BulkRow[] = rows.map((r, i) => {
      const startM = i === 0 ? cursor : cursor;
      const endM = startM + durations[i];
      const nr: BulkRow = { ...r, period: i + 1, start: fromMinutes(startM), end: fromMinutes(endM) };
      cursor = endM;
      return nr;
    });
    return aligned;
  };
  const handleBulkGenerate = () => {
    try {
      const v = bulkForm.getValues();
      // Coerce numeric fields (RHF returns strings for <input type="number">)
      const periodMinutesNum = Number(v.periodMinutes);
      const periodCountNum = v.mode === 'count' ? Number(v.periodCount) : undefined;
      const lunchAfterNum = v.lunchAfter !== undefined ? Number(v.lunchAfter) : undefined;
      const lunchMinutesNum = v.lunchMinutes !== undefined ? Number(v.lunchMinutes) : undefined;
      // Guard common misconfigurations
      if (v.mode === 'hours' && !v.endTime) {
        toast({ title: 'End time required', description: 'Please provide an end time or switch to Fixed count mode.', variant: 'destructive' });
        return;
      }
      if (!Number.isFinite(periodMinutesNum) || periodMinutesNum <= 0) {
        toast({ title: 'Invalid duration', description: 'Period duration must be a positive number of minutes.', variant: 'destructive' });
        return;
      }
      const slots = generateBulkRows(
        v.startTime,
        v.mode === 'hours' ? (v.endTime || undefined) : undefined,
        periodMinutesNum,
        periodCountNum,
        lunchAfterNum,
        lunchMinutesNum
      );
      if (!slots || slots.length === 0) {
        toast({ title: 'No periods generated', description: 'Check the time range and duration, or increase period count.', variant: 'default' });
        setBulkRows([]);
        return;
      }
      const subs = subjectsForClass(schoolSettings, v.className) || [];
      const teacher = v.defaultTeacher || '';
      const rows: BulkRow[] = slots.map((s, idx) => ({
        period: idx + 1,
        start: s.start,
        end: s.end,
        subject: subs[idx % (subs.length || 1)] || '',
        teacher,
      }));
      setBulkRows(rows);
      toast({ title: 'Generated', description: `Created ${rows.length} period${rows.length === 1 ? '' : 's'} for editing.`, variant: 'default' });
    } catch (e) {
      toast({ title: 'Generate Failed', description: e instanceof Error ? e.message : 'Invalid inputs', variant: 'destructive' });
    }
  };
  const handleAutoFillSubjects = () => {
    const v = bulkForm.getValues();
    const subs = subjectsForClass(schoolSettings, v.className) || [];
    if (subs.length === 0) {
      toast({ title: 'No subjects found', description: 'Admin Settings has no subjects for the selected class.', variant: 'default' });
    }
    setBulkRows((prev) => prev.map((r, i) => ({ ...r, subject: subs[i % (subs.length || 1)] || '' })));
  };
  const handleApplyTeacherAll = () => {
    const t = bulkForm.getValues('defaultTeacher') || '';
    setBulkRows((prev) => prev.map((r) => ({ ...r, teacher: t })));
  };
  const handleBulkSubmit = async () => {
    const v = bulkForm.getValues();
    if (!v.days || v.days.length === 0) {
      toast({ title: 'Pick days', description: 'Select at least one day.', variant: 'destructive' });
      return;
    }
    if (!v.className) {
      toast({ title: 'Class required', description: 'Please select a class.', variant: 'destructive' });
      return;
    }
    if (bulkRows.length === 0) {
      toast({ title: 'Nothing to create', description: 'Generate rows before submitting.', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      for (const day of v.days) {
        for (const row of bulkRows) {
          const staffItem = staff.find((s) => s.name === row.teacher);
          const teacherStaffId = staffItem?.staffId || row.teacher;
          await createTimetableEntry({
            day,
            period: row.period,
            startTime: row.start,
            endTime: row.end,
            subject: row.subject,
            class: v.className,
            section: v.section || '',
            teacherStaffId,
            teacherName: row.teacher,
          });
        }
      }
      toast({ title: 'Created', description: 'Bulk timetable entries created successfully.' });
      setIsBulkOpen(false);
      setBulkRows([]);
      await fetchTimetable(form.getValues());
    } catch (e) {
      toast({ title: 'Bulk create failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchTimetable(form.getValues());
  }, []); // Fetch on initial load with default empty filters

  // Load staff for teacher dropdown
  useEffect(() => {
    (async () => {
      try {
        const s = await listStaff();
        setStaff(s);
      } catch (e) {
        // Non-blocking; show a soft toast
        toast({ title: 'Could not load staff list', description: 'Teacher dropdown may be limited to current timetable.', variant: 'default' });
      }
    })();
  }, [toast]);

  // Load Admin Settings for classes/sections/subjects
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSchoolSettings();
        if (!mounted || !s) return;
        setSchoolSettings(s);
        const cls = listClasses(s);
        setClassOptions(cls);
      } catch (e) {
        // graceful: keep options empty
        console.warn('Failed to load Admin Settings for timetable options', e);
      }
    })();
    return () => { mounted = false };
  }, []);

  const onSubmitFilters = (values: AdminTimetableFilterFormValues) => {
    fetchTimetable(values);
  };

  const handleClearFilters = () => {
    form.reset({ classFilter: '', sectionFilter: '', teacherFilter: '' });
    fetchTimetable();
  };
  
  // Add/Edit Entry Form
  const entryForm = useForm<TimetableEntryFormValues>({
    resolver: zodResolver(TimetableEntryFormSchema),
    defaultValues: {
      day: 'Monday',
      period: 1,
      timeSlot: '',
      subject: '',
      teacher: '',
      class: '',
      section: '',
    },
  });

  const openAddDialog = () => {
    setEditingEntry(null);
    entryForm.reset({ day: 'Monday', period: 1, timeSlot: '', subject: '', teacher: '', class: '', section: '' });
    setIsDialogOpen(true);
  };

  const handleExportTimetable = () => {
    if (!timetableEntries || timetableEntries.length === 0) {
      toast({ title: 'Nothing to export', description: 'No timetable entries in the current view.', variant: 'destructive' });
      return;
    }
    const headers = ['Day','Period','Time Slot','Subject','Class','Section','Teacher'];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      if (s.includes('"')) return '"' + s.replace(/"/g, '""') + '"';
      if (s.includes(',') || s.includes('\n')) return '"' + s + '"';
      return s;
    };
    const rows = timetableEntries.map(e => [e.day, e.period, e.timeSlot, e.subject, e.class ?? '', e.section ?? '', e.teacher]);
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const f = form.getValues();
    const filterBits = [f.classFilter && `class-${f.classFilter}`, f.sectionFilter && `sec-${f.sectionFilter}`, f.teacherFilter && `teacher-${f.teacherFilter}`].filter(Boolean).join('_') || 'all';
    a.href = url;
    a.download = `timetable_${filterBits}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Timetable CSV downloaded.' });
  };
  
  const handleEditEntry = (entry: TimetableEntry) => {
     setEditingEntry(entry);
     entryForm.reset({
      day: entry.day,
      period: entry.period,
      timeSlot: entry.timeSlot,
      subject: entry.subject,
      teacher: entry.teacher,
      class: entry.class ?? '',
      section: entry.section ?? '',
     });
     setIsDialogOpen(true);
  };

  // Helper to parse timeSlot like "HH:MM - HH:MM" into start/end
  const splitTimeSlot = (s: string): { start: string; end: string } => {
    const m = s.match(/^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
    if (!m) {
      // Default slot if user typed incorrectly
      return { start: '09:00', end: '09:45' };
    }
    return { start: m[1], end: m[2] };
  };

  const onSubmitEntry = async (values: TimetableEntryFormValues) => {
    try {
      setIsSaving(true);
      const teacherName = values.teacher;
      const staffItem = staff.find(s => s.name === teacherName);
      const teacherStaffId = staffItem?.staffId || teacherName; // fallback to name if not found
      const { start, end } = splitTimeSlot(values.timeSlot);

      if (editingEntry) {
        await updateTimetableEntry({
          id: editingEntry.id,
          day: values.day,
          period: values.period,
          startTime: start,
          endTime: end,
          subject: values.subject,
          class: values.class || '',
          section: values.section || '',
          teacherStaffId,
          teacherName,
        } as any);
        toast({ title: 'Entry Updated', description: 'The timetable entry has been updated.' });
      } else {
        await createTimetableEntry({
          day: values.day,
          period: values.period,
          startTime: start,
          endTime: end,
          subject: values.subject,
          class: values.class || '',
          section: values.section || '',
          teacherStaffId,
          teacherName,
        });
        toast({ title: 'Entry Created', description: 'A new timetable entry has been added.' });
      }
      setIsDialogOpen(false);
      await fetchTimetable(form.getValues());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save entry.';
      toast({ title: 'Save Failed', description: msg, variant: 'destructive' });
      setIsSaving(false);
    }
  };

  const groupedTimetable = useMemo(() => groupTimetableByDay(timetableEntries), [timetableEntries]);
  // Filter form dependent options
  const selectedFilterClass = form.watch('classFilter');
  const filterSectionOptions = useMemo(() => {
    return sectionsForClass(schoolSettings, selectedFilterClass || undefined);
  }, [schoolSettings, selectedFilterClass]);
  // Entry dialog dependent options
  const selectedEntryClass = entryForm.watch('class');
  const entrySectionOptions = useMemo(() => {
    return sectionsForClass(schoolSettings, selectedEntryClass || undefined);
  }, [schoolSettings, selectedEntryClass]);
  const entrySubjectOptions = useMemo(() => {
    const global = listSubjects(schoolSettings);
    const map = schoolSettings?.classSubjects || {};
    if (selectedEntryClass && Array.isArray(map[selectedEntryClass]) && map[selectedEntryClass]!.length > 0) {
      return map[selectedEntryClass]!;
    }
    return global;
  }, [schoolSettings, selectedEntryClass]);
  const teacherOptions = useMemo(() => {
    const staffNames = staff?.map(s => s.name) ?? [];
    if (staffNames.length > 0) return Array.from(new Set(staffNames)).sort();
    return Array.from(new Set(timetableEntries.map(e => e.teacher))).sort();
  }, [staff, timetableEntries]);

  const firstDayWithEntries = useMemo(() => 
    daysOfWeek.find(day => groupedTimetable[day] && groupedTimetable[day].length > 0) || daysOfWeek[0],
    [groupedTimetable]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Management"
        description="View, filter, and manage school timetables."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportTimetable}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Bulk Add Periods
            </Button>
          </div>
        }
      />

      <Card className="border shadow-2xl rounded-2xl ring-1 ring-black/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
          <CardDescription>Filter timetable entries by class, section, or teacher.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitFilters)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField
                control={form.control}
                name="classFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__ALL__' ? '' : val)}>
                        <SelectTrigger className="h-10 rounded-xl shadow-md border bg-background hover:shadow-lg transition ring-1 ring-inset ring-muted/30 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl">
                          <SelectItem value="__ALL__">All</SelectItem>
                          {classOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sectionFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__ALL__' ? '' : val)}>
                        <SelectTrigger className="h-10 rounded-2xl shadow-lg border bg-background hover:shadow-2xl transition ring-2 ring-inset ring-muted/40 focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-3xl">
                          <SelectItem value="__ALL__">All</SelectItem>
                          {filterSectionOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacherFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__ALL__' ? '' : val)}>
                        <SelectTrigger className="h-10 rounded-xl shadow-md border bg-background hover:shadow-lg transition ring-1 ring-inset ring-muted/30 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl">
                          <SelectItem value="__ALL__">All</SelectItem>
                          {teacherOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="shadow-md hover:shadow-xl transition hover:translate-y-px">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Apply
                </Button>
                <Button type="button" variant="outline" onClick={handleClearFilters} disabled={isLoading} className="shadow-md hover:shadow-xl transition hover:translate-y-px">
                  <RotateCcw className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card className="border shadow-md"><CardContent className="pt-6"><DayTimetableSkeleton /></CardContent></Card>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertIcon className="h-5 w-5" />
          <AlertMsgTitle>Error Loading Timetable</AlertMsgTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <Card className="border shadow-2xl rounded-2xl ring-1 ring-black/5">
          <CardContent className="pt-6">
            {timetableEntries.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Timetable Entries Found</p>
                <p>Try adjusting your filters or add new entries.</p>
              </div>
            ) : (
              <Tabs defaultValue={firstDayWithEntries} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 mb-4 rounded-2xl bg-muted/40 p-1 shadow-inner ring-1 ring-black/5">
                  {daysOfWeek.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      disabled={!groupedTimetable[day] || groupedTimetable[day].length === 0}
                      className="text-xs sm:text-sm py-2 rounded-xl shadow-md hover:shadow-lg transition data-[state=active]:shadow-xl data-[state=active]:bg-white data-[state=active]:text-foreground"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {daysOfWeek.map((day) => (
                  <TabsContent key={day} value={day}>
                    {groupedTimetable[day] && groupedTimetable[day].length > 0 ? (
                      <div className="rounded-2xl border shadow-xl ring-1 ring-black/5 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-background sticky top-0 shadow-sm">
                            <TableRow>
                              <TableHead className="w-[8%] text-center text-xs uppercase font-medium text-muted-foreground">Period</TableHead>
                              <TableHead className="w-[17%] text-xs uppercase font-medium text-muted-foreground">Time</TableHead>
                              <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
                              <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
                              <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Teacher</TableHead>
                              <TableHead className="w-[10%] text-right text-xs uppercase font-medium text-muted-foreground">Edit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const dayEntries = groupedTimetable[day];
                              const groups = new Map<string, TimetableEntry[]>();
                              dayEntries.forEach((e) => {
                                const cls = (e.class?.trim() || 'Unassigned');
                                const sec = (e.section?.trim() || '');
                                const key = `${cls}||${sec}`;
                                if (!groups.has(key)) groups.set(key, []);
                                groups.get(key)!.push(e);
                              });
                              const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
                                const [ca, sa] = a.split('||');
                                const [cb, sb] = b.split('||');
                                return ca.localeCompare(cb) || sa.localeCompare(sb);
                              });
                              return sortedKeys.map((key) => {
                                const [cls, sec] = key.split('||');
                                const entries = groups.get(key)!.slice().sort((a, b) => a.period - b.period);
                                return (
                                  <Fragment key={key}>
                                    <TableRow className="bg-muted/60">
                                      <TableCell colSpan={6} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        {cls}{sec ? ` - ${sec}` : ''}
                                      </TableCell>
                                    </TableRow>
                                    {entries.map((entry) => (
                                      <TableRow key={entry.id} className="hover:bg-muted/30 transition">
                                        <TableCell className="text-center font-medium">{entry.period}</TableCell>
                                        <TableCell>{entry.timeSlot}</TableCell>
                                        <TableCell className="font-medium">{entry.subject}</TableCell>
                                        <TableCell>{`${entry.class || ''}${entry.section ? `-${entry.section}` : ''}`}</TableCell>
                                        <TableCell>{entry.teacher}</TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEntry(entry)}>
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit Entry</span>
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </Fragment>
                                );
                              });
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Info className="h-10 w-10 mx-auto mb-3 opacity-60" />
                        <p>No classes scheduled for {day} matching your filters.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Timetable Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update the details of this timetable entry.' : 'Fill out the details to add a new timetable entry.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...entryForm}>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={entryForm.handleSubmit(onSubmitEntry)}>
              <FormField
                control={entryForm.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-8 rounded-md border-2 border-muted/60 bg-background focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} className="rounded-md border-2 border-muted/60 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Time Slot</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 09:00 - 09:45" className="rounded-md border-2 border-muted/60 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v || '')}>
                        <SelectTrigger className="h-8 rounded-md border-2 border-muted/60 bg-background focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {entrySubjectOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="teacher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v)}>
                        <SelectTrigger className="h-8 rounded-md border-2 border-muted/60 bg-background focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/50">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__ALL__' ? '' : val)}>
                        <SelectTrigger className="h-8 rounded-md border bg-background ring-1 ring-inset ring-muted/30 focus-visible:ring-2 focus-visible:ring-primary/40">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">None</SelectItem>
                          {classOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={entryForm.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__NONE__' ? '' : val)}>
                        <SelectTrigger className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-background shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">None</SelectItem>
                          {entrySectionOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEntry ? 'Save Changes' : 'Add Entry'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Periods Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="w-[92vw] max-w-[880px] max-h-[85vh] overflow-y-auto rounded-sm p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>Bulk Add Periods</DialogTitle>
            <DialogDescription>
              Select class/section, days and schedule. Auto-generate periods, set subjects/teachers, and create all entries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Top controls */}
            <Form {...bulkForm}>
              <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Class */}
                <FormField
                  control={bulkForm.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Section */}
                <FormField
                  control={bulkForm.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v === '__NONE__' ? '' : v)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__NONE__">None</SelectItem>
                            {sectionsForClass(schoolSettings, bulkForm.watch('className')).map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Days picker */}
                <FormField
                  control={bulkForm.control}
                  name="days"
                  render={() => (
                    <FormItem>
                      <FormLabel>Days</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((d) => {
                          const selected = (bulkForm.watch('days') || []).includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                const current = new Set(bulkForm.getValues('days'));
                                if (current.has(d)) current.delete(d); else current.add(d);
                                bulkForm.setValue('days', Array.from(current) as DayOfWeek[], { shouldValidate: true });
                              }}
                              className={`px-2 py-1 text-xs rounded border ${selected ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                            >{d.slice(0,3)}</button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mode toggle */}
                <FormField
                  control={bulkForm.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Schedule Mode</FormLabel>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="bulk-mode" value="hours" checked={field.value === 'hours'} onChange={() => field.onChange('hours')} />
                          <span>School hours (start–end + duration)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="bulk-mode" value="count" checked={field.value === 'count'} onChange={() => field.onChange('count')} />
                          <span>Fixed count (start + count + duration)</span>
                        </label>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Time inputs */}
                <FormField control={bulkForm.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {bulkForm.watch('mode') === 'hours' ? (
                  <FormField control={bulkForm.control} name="endTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" step={60} className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <FormField control={bulkForm.control} name="periodCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={bulkForm.control} name="periodMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Duration (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Lunch settings */}
                <FormField control={bulkForm.control} name="lunchAfter" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lunch after period # (0 = none)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={bulkForm.control} name="lunchMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lunch Duration (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Default teacher for all (optional) */}
                <FormField control={bulkForm.control} name="defaultTeacher" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply Same Teacher (optional)</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v === '__NONE__' ? '' : v)}>
                        <SelectTrigger className="h-8 rounded-md border bg-background ring-1 ring-inset ring-muted/30 focus-visible:ring-2 focus-visible:ring-primary/40">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">None</SelectItem>
                          {teacherOptions.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="sm:col-span-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleBulkGenerate}>Generate</Button>
                  <Button type="button" variant="outline" onClick={handleAutoFillSubjects}>Auto-fill Subjects</Button>
                  <Button type="button" variant="outline" onClick={handleApplyTeacherAll}>Apply Teacher To All</Button>
                  <Button type="button" variant="outline" onClick={() => setBulkRows(prev => normalizeRowsByTime(prev))}>Sort by Time</Button>
                  <Button type="button" variant="outline" onClick={() => setBulkRows(prev => alignTimesToOrder(prev))}>Align Times to Order</Button>
                </div>
              </form>
            </Form>

            {/* Editable rows */}
            <div className="border rounded max-h-[38vh] overflow-y-auto">
              <Table className="text-sm">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[8%] py-2">#</TableHead>
                    <TableHead className="w-[22%] py-2">Time</TableHead>
                    <TableHead className="w-[30%] py-2">Subject</TableHead>
                    <TableHead className="w-[30%] py-2">Teacher</TableHead>
                    <TableHead className="w-[10%] py-2"/>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkRows.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-2">Click Generate to create rows</TableCell></TableRow>
                  ) : bulkRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="py-2">{row.period}</TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Input type="time" value={row.start} onChange={(e) => editRow(idx, { start: e.target.value })} className="w-24 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" />
                          <span>-</span>
                          <Input type="time" value={row.end} onChange={(e) => editRow(idx, { end: e.target.value })} className="w-24 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4" />
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Select value={row.subject || undefined} onValueChange={(v) => editRow(idx, { subject: v })}>
                          <SelectTrigger className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-background shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4"><SelectValue placeholder="Select subject" /></SelectTrigger>
                          <SelectContent>
                            {subjectsForClass(schoolSettings, bulkForm.watch('className')).map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2">
                        <Select value={row.teacher || undefined} onValueChange={(v) => editRow(idx, { teacher: v })}>
                          <SelectTrigger className="h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-background shadow-sm hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/40 focus-visible:ring-4"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                          <SelectContent>
                            {teacherOptions.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => moveRow(idx, -1)} disabled={idx===0}><ChevronUp className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => moveRow(idx, 1)} disabled={idx===bulkRows.length-1}><ChevronDown className="h-4 w-4"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleBulkSubmit} disabled={isSaving || bulkRows.length===0}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Entries
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
