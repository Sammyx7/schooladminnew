
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Receipt, Loader2, AlertCircle as AlertIcon, CreditCard } from 'lucide-react'; // Renamed AlertCircle
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { FeeNotice, FeeNoticeStatus } from '@/lib/types';
import { getStudentFeeNotices } from '@/lib/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function StudentFeeNoticesPage() {
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentFeeNotices("S10234"); 
        setFeeNotices(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching fee notices.");
        }
        console.error("Failed to fetch fee notices:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePayNow = (notice: FeeNotice) => {
    toast({
      title: "Payment Initiated (Demo)",
      description: `Proceeding to payment for: ${notice.title}`,
    });
  };
  
  const getStatusBadgeClassName = (status: FeeNoticeStatus): string => {
    switch (status) {
        case 'Paid':
            return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-400 dark:border-yellow-700';
        case 'Overdue':
            return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
        default:
            return '';
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="My Fee Notices"
        icon={Receipt}
        description="View your current and past fee notices, payment status, and dues."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Fee Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Fee Notices</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && feeNotices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No fee notices found.</p>
              <p>It looks like all your payments are up to date, or there are no notices to display at the moment.</p>
            </div>
          )}

          {!isLoading && !error && feeNotices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Notice Title</TableHead>
                  <TableHead className="w-[40%] md:w-[30%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="font-medium hidden md:table-cell">{notice.title}</TableCell>
                    <TableCell>
                        <span className="md:hidden font-medium">{notice.title}</span>
                        {notice.description && <p className="text-xs text-muted-foreground mt-0.5 md:mt-0">{notice.description}</p>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {notice.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(notice.dueDate), "do MMMM, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClassName(notice.status)}>
                        {notice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {notice.status === 'Pending' || notice.status === 'Overdue' ? (
                        <Button
                          size="sm"
                          onClick={() => handlePayNow(notice)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Now
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No actions</span>
                      )}
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
