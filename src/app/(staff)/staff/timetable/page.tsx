
import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarDays, AlertCircle as AlertIcon, Info, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { TimetableEntry, DayOfWeek } from '@/lib/types';
import { getStaffTimetable } from '@/lib/services/staffService';


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

export default async function StaffTimetablePage() {
  let timetableEntries: TimetableEntry[] = [];
  let error: string | null = null;

  const MOCK_STAFF_ID = "TCH102"; 

  try {
    timetableEntries = await getStaffTimetable(MOCK_STAFF_ID);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error fetching timetable.";
    console.error("Failed to fetch staff timetable:", err);
  }

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
          {error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Timetable</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!error && (
            timetableEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Timetable Available</p>
                <p>Your timetable has not been published or assigned yet.</p>
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
