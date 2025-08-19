
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
import { CalendarCheck, Filter, Loader2, AlertCircle as AlertIcon, Download, RotateCcw } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { StudentAttendanceRecord, StudentAttendanceFilterFormValues, AttendanceStatus } from '@/lib/types';
import { StudentAttendanceFilterSchema, attendanceStatuses } from '@/lib/types';
import { getAdminStudentAttendanceRecords } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';

export default function AdminStudentAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<StudentAttendanceFilterFormValues>({
    resolver: zodResolver(StudentAttendanceFilterSchema),
    defaultValues: {
      classFilter: '',
      sectionFilter: '',
      dateFilter: undefined,
    },
  });

  const fetchAttendanceRecords = async (filters?: StudentAttendanceFilterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminStudentAttendanceRecords(filters);
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

  const onSubmitFilters = (values: StudentAttendanceFilterFormValues) => {
    fetchAttendanceRecords(values);
  };

  const handleClearFilters = () => {
    form.reset({ classFilter: '', sectionFilter: '', dateFilter: undefined });
    fetchAttendanceRecords();
  }

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
      const headers = ['Date', 'Student ID', 'Student Name', 'Class', 'Section', 'Status'];
      const rows = attendanceRecords.map(r => [
        format(new Date(r.date), 'yyyy-MM-dd'),
        r.studentId,
        r.studentName,
        r.class,
        r.section,
        r.status,
      ]);
      const csv = [headers, ...rows]
        .map(cols => cols.map(escapeCsv).join(','))
        .join('\n');

      const filters = form.getValues();
      const parts: string[] = ['attendance_student'];
      if (filters.classFilter) parts.push(`class_${filters.classFilter}`);
      if (filters.sectionFilter) parts.push(`section_${filters.sectionFilter}`);
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
        title="Student Attendance Records"
        icon={CalendarCheck}
        description="View, filter, and manage student attendance."
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
                name="classFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10" {...field} />
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
                      <Input placeholder="e.g., A" {...field} />
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
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
                  <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground">Section</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
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
              <CalendarCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Attendance Records Found</p>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}

          {!isLoading && !error && attendanceRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Section</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.section}</TableCell>
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
    </div>
  );
}
