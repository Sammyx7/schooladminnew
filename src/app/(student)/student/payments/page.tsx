
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { History, Loader2, AlertCircle as AlertIcon, FileText, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentRecord } from '@/lib/types';
import { getStudentPaymentHistory } from '@/lib/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export default function StudentPaymentsPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentPaymentHistory("S10234"); 
        setPaymentHistory(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching payment history.");
        }
        console.error("Failed to fetch payment history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewReceipt = (record: PaymentRecord) => {
    toast({
      title: "View Receipt (Demo)",
      description: `Viewing receipt for payment of ₹${record.amountPaid} on ${format(parseISO(record.paymentDate), "do MMMM, yyyy")}`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payment History"
        icon={History}
        description="View records of all your past payments and transactions."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%] hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground">Payment Date</TableHead>
                  <TableHead className="w-[35%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right w-[15%] text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="w-[20%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Payment Method</TableHead>
                  <TableHead className="text-right w-[10%] text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Payment History</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && paymentHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Landmark className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Payment History Found</p>
              <p>It looks like there are no payment records to display at the moment.</p>
            </div>
          )}

          {!isLoading && !error && paymentHistory.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground">Payment Date</TableHead>
                  <TableHead className="w-[40%] sm:w-[30%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right w-[20%] sm:w-[15%] text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="w-[30%] sm:w-[25%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Payment Method</TableHead>
                  <TableHead className="text-right w-[15%] sm:w-[15%] text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="hidden sm:table-cell">
                      {format(parseISO(record.paymentDate), "dd MMM, yyyy, p")}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.description}</span>
                      <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                        {format(parseISO(record.paymentDate), "dd MMM, yyyy, p")}
                      </p>
                       {record.transactionId && <p className="text-xs text-muted-foreground mt-0.5 md:hidden">ID: {record.transactionId}</p>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {record.amountPaid.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{record.paymentMethod}</span>
                        {record.transactionId && <p className="text-xs text-muted-foreground mt-0.5">ID: {record.transactionId}</p>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(record)}
                        className="border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Receipt
                      </Button>
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

