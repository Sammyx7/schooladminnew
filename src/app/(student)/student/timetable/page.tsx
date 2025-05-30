
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays, Loader2, AlertCircle, Info, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimetableEntry, DayOfWeek } from '@/lib/types';
import { getStudentTimetable } from '@/lib/services/studentService';

const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const groupTimetableByDay = (entries: TimetableEntry[]): Record<DayOfWeek, TimetableEntry[]> => {
  const grouped = {} as Record<DayOfWeek, TimetableEntry[]>;
  daysOfWeek.forEach(day => grouped[day] = []); // Initialize all days

  entries.forEach((entry) => {
    grouped[entry.day].push(entry);
  });

  for (const day in grouped) {
    grouped[day as DayOfWeek].sort((a, b) => a.period - b.period); // Sort by period
  }
  return grouped;
};

const DayTimetableSkeleton = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[15%]"><Skeleton className="h-5 w-12" /></TableHead>
        <TableHead className="w-[25%]"><Skeleton className="h-5 w-24" /></TableHead>
        <TableHead className="w-[35%]"><Skeleton className="h-5 w-32" /></TableHead>
        <TableHead className="w-[25%]"><Skeleton className="h-5 w-24" /></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const TimetablePageSkeleton = () => (
  <div className="space-y-6">
    <PageHeader title="My Timetable" icon={CalendarDays} description="Your weekly class schedule." />
    <Card className="border shadow-md">
      <CardContent className="pt-6">
        <div className="grid w-full grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {daysOfWeek.map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
        <DayTimetableSkeleton />
      </CardContent>
    </Card>
  </div>
);


export default function StudentTimetablePage() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, studentId would come from auth context
        const data = await getStudentTimetable("S10234"); // Change to "S10235" for different data
        setTimetableEntries(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching timetable.");
        }
        console.error("Failed to fetch timetable:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const groupedTimetable = useMemo(() => groupTimetableByDay(timetableEntries), [timetableEntries]);
  const firstDayWithEntries = useMemo(() => 
    daysOfWeek.find(day => groupedTimetable[day] && groupedTimetable[day].length > 0) || daysOfWeek[0],
    [groupedTimetable]
  );


  if (isLoading) {
    return <TimetablePageSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Timetable" icon={CalendarDays} description="Your weekly class schedule." />
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-5 w-5" />
          <AlertMsgTitle>Error Fetching Timetable</AlertMsgTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timetable"
        icon={CalendarDays}
        description="Your weekly class schedule. Click on a day to view details."
      />

      <Card className="border shadow-md">
        <CardContent className="pt-6">
          {timetableEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Timetable Available</p>
              <p>Your timetable has not been published yet or is currently unavailable.</p>
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
                          <TableHead className="w-[15%] sm:w-[10%] text-center">Period</TableHead>
                          <TableHead className="w-[30%] sm:w-[25%]">Time</TableHead>
                          <TableHead className="w-[35%] sm:w-[40%]">Subject</TableHead>
                          <TableHead className="w-[20%] sm:w-[25%] hidden sm:table-cell">Teacher</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedTimetable[day].map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-center font-medium">{entry.period}</TableCell>
                            <TableCell>{entry.timeSlot}</TableCell>
                            <TableCell className="font-medium">{entry.subject}</TableCell>
                            <TableCell className="hidden sm:table-cell">{entry.teacher}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <Info className="h-10 w-10 mx-auto mb-3 opacity-60" />
                      <p>No classes scheduled for {day}.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
