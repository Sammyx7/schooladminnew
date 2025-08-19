
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays, Loader2, AlertCircle as AlertIcon, Info, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimetableEntry, DayOfWeek } from '@/lib/types';
import { getStaffTimetable } from '@/lib/services/staffService'; // Updated service
import { useAuth } from '@/contexts/AuthContext'; // To get staffId if needed, or use a mock

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
  <>
    {/* Mobile skeleton */}
    <div className="md:hidden space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
    {/* Desktop skeleton */}
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-12" /></TableHead>
          <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-24" /></TableHead>
          <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-32" /></TableHead>
          <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-24" /></TableHead>
          <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-24" /></TableHead>
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
  </>
);

export default function StaffTimetablePage() {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { user } = useAuth(); // If you have user object with staffId

  const MOCK_STAFF_ID = "TCH102"; // Using Mr. Vikram Singh's ID as per staffService mock

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // const staffIdToFetch = user?.staffId || MOCK_STAFF_ID; // Or however you get staffId
        const data = await getStaffTimetable(MOCK_STAFF_ID);
        setTimetableEntries(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error fetching timetable.";
        setError(msg);
        console.error("Failed to fetch staff timetable:", err);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timetable"
        icon={CalendarDays}
        description="Your weekly teaching schedule."
      />

      <Card className="border shadow-md">
        <CardContent className="pt-6">
          {isLoading && <DayTimetableSkeleton />}
          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Timetable</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            timetableEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Timetable Available</p>
                <p>Your timetable has not been published or assigned yet.</p>
              </div>
            ) : (
              <Tabs defaultValue={firstDayWithEntries} className="w-full">
                <div className="-mx-1 sm:mx-0 overflow-x-auto">
                  <TabsList className="grid w-full min-w-max grid-cols-6 sm:grid-cols-4 md:grid-cols-6 gap-1.5 mb-4 px-1">
                  {daysOfWeek.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      disabled={!groupedTimetable[day] || groupedTimetable[day].length === 0}
                      className="text-xs sm:text-sm py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                  </TabsList>
                </div>
                {daysOfWeek.map((day) => (
                  <TabsContent key={day} value={day}>
                    {groupedTimetable[day] && groupedTimetable[day].length > 0 ? (
                      <>
                        {/* Mobile list */}
                        <div className="md:hidden space-y-2">
                          {groupedTimetable[day].map((entry) => (
                            <div key={entry.id} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="font-semibold">P{entry.period}</div>
                                <div className="text-muted-foreground">{entry.timeSlot}</div>
                              </div>
                              <div className="mt-1 text-sm">
                                <div className="font-medium">{entry.subject}</div>
                                <div className="text-muted-foreground">Class {entry.class} • Sec {entry.section}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <Table className="hidden md:table">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[10%] text-center text-xs uppercase font-medium text-muted-foreground">Period</TableHead>
                              <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Time</TableHead>
                              <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
                              <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
                              <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Section</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupedTimetable[day].map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell className="text-center font-medium">{entry.period}</TableCell>
                                <TableCell>{entry.timeSlot}</TableCell>
                                <TableCell className="font-medium">{entry.subject}</TableCell>
                                <TableCell>{entry.class}</TableCell>
                                <TableCell>{entry.section}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Info className="h-10 w-10 mx-auto mb-3 opacity-60" />
                        <p>No classes scheduled for {day}.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
