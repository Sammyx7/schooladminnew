
"use client";

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays, Loader2, AlertCircle as AlertIcon, Info, Filter, Download, PlusCircle, Edit, RotateCcw, ClipboardList } from 'lucide-react';
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
import { getAdminTimetable, createAdminTimetableEntry, updateAdminTimetableEntry, getAdminStaffList } from '@/lib/services/adminService';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  period: z.coerce.number().int().positive({ message: 'Period must be a positive integer.' }),
  timeSlot: z.string().min(3, { message: 'Time slot is required.' }),
  subject: z.string().min(2, { message: 'Subject is required.' }),
  teacher: z.string().min(2, { message: 'Teacher is required.' }),
  class: z.string().optional().or(z.literal('')),
  section: z.string().optional().or(z.literal('')),
});
type TimetableEntryFormValues = z.infer<typeof TimetableEntryFormSchema>;

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

  const form = useForm<AdminTimetableFilterFormValues>({
    resolver: zodResolver(AdminTimetableFilterSchema),
    defaultValues: { classFilter: '', sectionFilter: '', teacherFilter: '' },
  });

  const fetchTimetable = async (filters?: AdminTimetableFilterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminTimetable(filters);
      setTimetableEntries(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching timetable.";
      setError(msg);
      toast({ title: "Error Fetching Timetable", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(form.getValues());
  }, []); // Fetch on initial load with default empty filters

  // Load staff for teacher dropdown
  useEffect(() => {
    (async () => {
      try {
        const s = await getAdminStaffList();
        setStaff(s);
      } catch (e) {
        // Non-blocking; show a soft toast
        toast({ title: 'Could not load staff list', description: 'Teacher dropdown may be limited to current timetable.', variant: 'default' });
      }
    })();
  }, [toast]);

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

  const onSubmitEntry = async (values: TimetableEntryFormValues) => {
    try {
      setIsSaving(true);
      if (editingEntry) {
        await updateAdminTimetableEntry(editingEntry.id, values);
        toast({ title: 'Entry Updated', description: 'The timetable entry has been updated.' });
      } else {
        await createAdminTimetableEntry(values);
        toast({ title: 'Entry Created', description: 'A new timetable entry has been added.' });
      }
      setIsDialogOpen(false);
      await fetchTimetable(form.getValues());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save entry.';
      toast({ title: 'Save Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const groupedTimetable = useMemo(() => groupTimetableByDay(timetableEntries), [timetableEntries]);
  const classOptions = useMemo(() => Array.from(new Set((timetableEntries.map(e => e.class).filter(Boolean) as string[]))).sort(), [timetableEntries]);
  const sectionOptions = useMemo(() => Array.from(new Set((timetableEntries.map(e => e.section).filter(Boolean) as string[]))).sort(), [timetableEntries]);
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
        icon={CalendarDays}
        description="View, filter, and manage school timetables."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportTimetable}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Entry
            </Button>
          </div>
        }
      />

      <Card className="border shadow-md">
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
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ALL__">All</SelectItem>
                          {sectionOptions.map(opt => (
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
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Apply
                </Button>
                <Button type="button" variant="outline" onClick={handleClearFilters} disabled={isLoading}>
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
        <Card className="border shadow-md">
          <CardContent className="pt-6">
            {timetableEntries.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Timetable Entries Found</p>
                <p>Try adjusting your filters or add new entries.</p>
              </div>
            ) : (
              <Tabs defaultValue={firstDayWithEntries} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 mb-4">
                  {daysOfWeek.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      disabled={!groupedTimetable[day] || groupedTimetable[day].length === 0}
                      className="text-xs sm:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {daysOfWeek.map((day) => (
                  <TabsContent key={day} value={day}>
                    {groupedTimetable[day] && groupedTimetable[day].length > 0 ? (
                      <Table>
                        <TableHeader>
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
                          {groupedTimetable[day].map((entry) => (
                            <TableRow key={entry.id}>
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
                        </TableBody>
                      </Table>
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
                        <SelectTrigger>
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
                      <Input type="number" min={1} {...field} />
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
                      <Input placeholder="e.g., 09:00 - 09:45" {...field} />
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
                      <Input placeholder="e.g., Mathematics" {...field} />
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
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger>
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
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val === '__NONE__' ? '' : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
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
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">None</SelectItem>
                          {sectionOptions.map(opt => (
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
    </div>
  );
}
