
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Receipt, CreditCard, AlertCircle as AlertIcon, CheckCircle, Clock } from 'lucide-react';
import type { FeeNotice } from '@/lib/types';
import { getStudentFeeNotices } from '@/lib/services/studentService';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function StudentFeesPage() {
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MOCK_STUDENT_ID = "S10234";

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentFeeNotices(MOCK_STUDENT_ID);
        setFeeNotices(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({ title: "Error Fetching Fee Notices", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handlePayNow = (notice: FeeNotice) => {
    toast({
      title: "Payment Gateway (Demo)",
      description: `Redirecting to payment for "${notice.title}". Total: ₹${notice.amount.toLocaleString('en-IN')}`,
    });
  };

  const getStatusBadge = (status: FeeNotice['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Paid
          </Badge>
        );
      case 'Due':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700">
            <Clock className="mr-1.5 h-3.5 w-3.5" /> Due
          </Badge>
        );
      case 'Overdue':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700">
            <AlertIcon className="mr-1.5 h-3.5 w-3.5" /> Overdue
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Notices"
        icon={Receipt}
        description="View your current and past fee notices."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>My Fee Notices</CardTitle>
          <CardDescription>Overview of all tuition, transport, and other fees.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Notice Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Fee Notices</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && feeNotices.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Fee Notices Found</p>
                <p>All your fee notices are cleared for now.</p>
            </div>
          )}

          {!isLoading && !error && feeNotices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%] text-xs uppercase font-medium text-muted-foreground">Notice Title</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="w-[15%] text-right text-xs uppercase font-medium text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeNotices.map((notice) => (
                  <TableRow key={notice.id} className={cn(notice.status === 'Paid' && 'text-muted-foreground')}>
                    <TableCell className="font-medium text-foreground">{notice.title}</TableCell>
                    <TableCell className="font-medium text-foreground">{notice.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{format(parseISO(notice.dueDate), "do MMMM, yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(notice.status)}</TableCell>
                    <TableCell className="text-right">
                      {notice.status !== 'Paid' ? (
                        <Button size="sm" onClick={() => handlePayNow(notice)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Now
                        </Button>
                      ) : (
                         <span className="text-xs">Paid on {format(parseISO(notice.paidDate!), "dd/MM/yy")}</span>
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
