
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import type { TimetableEntry, DayOfWeek, AdminTimetableFilterFormValues } from '@/lib/types';
import { AdminTimetableFilterSchema } from '@/lib/types';
import { getAdminTimetable } from '@/lib/services/adminService';
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

  const onSubmitFilters = (values: AdminTimetableFilterFormValues) => {
    fetchTimetable(values);
  };

  const handleClearFilters = () => {
    form.reset({ classFilter: '', sectionFilter: '', teacherFilter: '' });
    fetchTimetable();
  };
  
  const handleAddNewEntry = () => {
    toast({ title: "Add New Entry (Placeholder)", description: "This would open a form to add a new timetable entry." });
  };

  const handleExportTimetable = () => {
    toast({ title: "Export Timetable (Placeholder)", description: "This feature will download the current timetable view." });
  };
  
  const handleEditEntry = (entry: TimetableEntry) => {
     toast({ title: "Edit Entry (Placeholder)", description: `Editing timetable entry ID: ${entry.id}`});
  }

  const groupedTimetable = useMemo(() => groupTimetableByDay(timetableEntries), [timetableEntries]);
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
            <Button onClick={handleAddNewEntry}>
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
                    <FormControl><Input placeholder="e.g., 10" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., A" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., Mr. Singh" {...field} /></FormControl>
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
    </div>
  );
}
