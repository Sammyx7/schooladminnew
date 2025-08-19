
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserCheck, QrCode, Loader2, AlertCircle as AlertIcon, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { StaffAttendanceRecord, AttendanceStatus } from '@/lib/types';
import { getStaffOwnAttendanceHistoryDb } from '@/lib/services/staffAttendanceService';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext'; // If needed for staffId
import { useRouter } from 'next/navigation';

export default function StaffAttendancePage() {
  const [attendanceHistory, setAttendanceHistory] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  // const { user } = useAuth(); // To get staffId if available

  const MOCK_STAFF_ID = "TCH102"; // Using Mr. Vikram Singh's ID

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // const staffIdToFetch = user?.staffId || MOCK_STAFF_ID;
        const data = await getStaffOwnAttendanceHistoryDb(MOCK_STAFF_ID);
        setAttendanceHistory(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({ title: "Error Fetching Attendance", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleMarkAttendance = () => {
    // Navigate to the check-in page where a scanned QR will land, or allow manual token entry
    router.push('/staff/attendance/check-in');
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
        title="My Attendance"
        icon={UserCheck}
        description="View your attendance history and mark today's attendance."
        actions={
          <Button onClick={handleMarkAttendance}>
            <QrCode className="mr-2 h-4 w-4" />
            Mark Today's Attendance
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>My Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Attendance History</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && attendanceHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Attendance Records</p>
              <p>Your attendance history will appear here.</p>
            </div>
          )}

          {!isLoading && !error && attendanceHistory.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(parseISO(record.date), "EEEE, do MMMM, yyyy")}</TableCell>
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
