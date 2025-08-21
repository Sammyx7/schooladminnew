
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Filter, Loader2, AlertCircle as AlertIcon, Download, RotateCcw, QrCode } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { StaffAttendanceRecord, StaffAttendanceFilterFormValues, AttendanceStatus } from '@/lib/types';
import { StaffAttendanceFilterSchema, attendanceStatuses } from '@/lib/types';
import { getAdminStaffAttendanceRecords } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';
import StaffQrDialog from '@/components/attendance/StaffQrDialog';
import { getSupabase } from '@/lib/supabaseClient';

export default function AdminStaffAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [qrOpen, setQrOpen] = useState(false);

  const form = useForm<StaffAttendanceFilterFormValues>({
    resolver: zodResolver(StaffAttendanceFilterSchema),
    defaultValues: {
      departmentFilter: '',
      staffNameOrIdFilter: '',
      dateFilter: undefined,
    },
  });

  const fetchAttendanceRecords = async (filters?: StaffAttendanceFilterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminStaffAttendanceRecords(filters);
      setAttendanceRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Attendance", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords(form.getValues());
  }, []); // Fetch on initial load

  // Helper: append a new record smoothly if it matches current filters
  const appendIfMatches = async (incoming: { id: string; staffId: string; date: string; status: AttendanceStatus; staffName?: string; department?: string; }) => {
    const filters = form.getValues();
    // Filter checks
    if (filters.dateFilter) {
      const d = new Date(incoming.date);
      const f = filters.dateFilter;
      const sameDay = d.getUTCFullYear() === f.getFullYear() && d.getUTCMonth() === f.getMonth() && d.getUTCDate() === f.getDate();
      if (!sameDay) return; // outside current date filter
    }
    if (filters.departmentFilter && incoming.department) {
      if (!incoming.department.toLowerCase().includes(filters.departmentFilter.toLowerCase())) return;
    }
    if (filters.staffNameOrIdFilter) {
      const term = filters.staffNameOrIdFilter.toLowerCase();
      const hit = (incoming.staffName ?? '').toLowerCase().includes(term) || incoming.staffId.toLowerCase().includes(term);
      if (!hit) return;
    }

    // Avoid duplicates by id
    setAttendanceRecords(prev => {
      if (prev.some(r => r.id === incoming.id)) return prev;
      const next: StaffAttendanceRecord = {
        id: incoming.id,
        staffId: incoming.staffId,
        staffName: incoming.staffName ?? '',
        department: incoming.department ?? '',
        date: incoming.date,
        status: incoming.status,
      };
      const updated = [next, ...prev];
      // Ensure desc by date
      updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return updated;
    });
  };

  // Realtime subscription: append smoothly when new rows arrive
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel('realtime-staff-attendance')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_attendance' },
        async (payload: any) => {
          // payload.new has: { id, staff_id, date, status }
          const row = payload?.new;
          if (!row) return;
          const base = { id: String(row.id), staffId: String(row.staff_id), date: String(row.date), status: String(row.status) as AttendanceStatus };
          // Try to enrich with staff name/department using API
          try {
            const q = new URLSearchParams({ staffId: base.staffId }).toString();
            const res = await fetch(`/api/staff/profile?${q}`, { cache: 'no-store' });
            const prof = await res.json();
            await appendIfMatches({ ...base, staffName: prof?.name ?? '', department: prof?.department ?? '' });
          } catch {
            await appendIfMatches({ ...base });
          }
        }
      )
      // Also listen to manual broadcast from server route as a fallback
      .on('broadcast', { event: 'changed' }, async (msg: any) => {
        const p = msg?.payload;
        if (!p) return;
        // expect payload: { id, staff_id, date, status, name?, department? }
        const base = { id: String(p.id ?? ''), staffId: String(p.staff_id ?? ''), date: String(p.date ?? new Date().toISOString()), status: String(p.status ?? 'Present') as AttendanceStatus };
        let name = p.name as string | undefined;
        let dept = p.department as string | undefined;
        if (!name || !dept) {
          try {
            const q = new URLSearchParams({ staffId: base.staffId }).toString();
            const res = await fetch(`/api/staff/profile?${q}`, { cache: 'no-store' });
            const prof = await res.json();
            name = name ?? prof?.name;
            dept = dept ?? prof?.department;
          } catch { /* ignore */ }
        }
        await appendIfMatches({ ...base, staffName: name, department: dept });
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed frequent polling to avoid visible refreshes

  // Refetch when tab becomes active again
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        fetchAttendanceRecords(form.getValues());
      }
    };
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitFilters = (values: StaffAttendanceFilterFormValues) => {
    fetchAttendanceRecords(values);
  };

  const handleClearFilters = () => {
    form.reset({ departmentFilter: '', staffNameOrIdFilter: '', dateFilter: undefined });
    fetchAttendanceRecords();
  };

  const handleExportCSV = () => {
    try {
      if (attendanceRecords.length === 0) {
        toast({ title: "Nothing to Export", description: "No attendance records in the current view." });
        return;
      }
      const escapeCsv = (val: unknown): string => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const headers = ['Date', 'Staff ID', 'Staff Name', 'Department', 'Status'];
      const rows = attendanceRecords.map(r => [
        format(new Date(r.date), 'yyyy-MM-dd'),
        r.staffId,
        r.staffName,
        r.department,
        r.status,
      ]);
      const csv = [headers, ...rows]
        .map(cols => cols.map(escapeCsv).join(','))
        .join('\n');

      const filters = form.getValues();
      const parts: string[] = ['attendance_staff'];
      if (filters.departmentFilter) parts.push(`dept_${filters.departmentFilter.replace(/\s+/g, '_')}`);
      if (filters.staffNameOrIdFilter) parts.push(`staff_${filters.staffNameOrIdFilter.replace(/\s+/g, '_')}`);
      if (filters.dateFilter) parts.push(`date_${format(filters.dateFilter, 'yyyyMMdd')}`);
      const filename = `${parts.join('_')}.csv`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'CSV Exported', description: `Downloaded ${filename}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to export CSV.';
      toast({ title: 'Export Failed', description: msg, variant: 'destructive' });
    }
  };

  const handleGenerateQrCode = () => {
    setQrOpen(true);
  };

  const getStatusBadgeClassName = (status: AttendanceStatus): string => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'Excused':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Attendance Records"
        description="View, filter, and manage staff attendance."
        actions={
            <Button onClick={handleGenerateQrCode} variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
            </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitFilters)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField
                control={form.control}
                name="departmentFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Academics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staffNameOrIdFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Name or ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mr. Singh or TCH102" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateFilter"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Date</FormLabel>
                     <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Apply Filters
                </Button>
                 <Button type="button" variant="outline" onClick={handleClearFilters} disabled={isLoading}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Attendance List</CardTitle>
          <Button variant="outline" onClick={handleExportCSV} disabled={attendanceRecords.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Staff ID</TableHead>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Department</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Attendance</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && attendanceRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Staff Attendance Records Found</p>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}

          {!isLoading && !error && attendanceRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Staff ID</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Department</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.staffId}</TableCell>
                    <TableCell className="font-medium">{record.staffName}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{format(new Date(record.date), "do MMM, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs py-1", getStatusBadgeClassName(record.status))}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staff Attendance QR Dialog */}
      <StaffQrDialog open={qrOpen} onOpenChange={setQrOpen} ttlSeconds={60} />
    </div>
  );
}
