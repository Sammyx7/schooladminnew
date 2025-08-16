
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { History, AlertCircle as AlertIcon } from 'lucide-react';
import type { PaymentRecord } from '@/lib/types';
import { getStudentPaymentHistory } from '@/lib/services/studentService';
import { format, parseISO } from 'date-fns';

export default function StudentPaymentsPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MOCK_STUDENT_ID = "S10234";

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentPaymentHistory(MOCK_STUDENT_ID);
        setPaymentHistory(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({ title: "Error Fetching Payments", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        icon={History}
        description="View a complete record of all your past payments."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>My Payments</CardTitle>
          <CardDescription>A list of all successful transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Date</TableHead>
                  <TableHead className="w-[45%]">Description</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Payment History</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && paymentHistory.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Payment History</p>
                <p>Your past payments will be listed here.</p>
            </div>
          )}

          {!isLoading && !error && paymentHistory.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Transaction ID</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(parseISO(payment.date), "do MMMM, yyyy")}</TableCell>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell className="font-mono text-sm hidden md:table-cell">{payment.transactionId}</TableCell>
                    <TableCell className="text-right font-medium">{payment.amount.toLocaleString('en-IN')}</TableCell>
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
