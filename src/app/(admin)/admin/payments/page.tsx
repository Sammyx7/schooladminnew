
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { History, Filter, Loader2, AlertCircle as AlertIcon, RotateCcw, Download, Eye } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AdminPaymentRecord, AdminPaymentFiltersFormValues } from '@/lib/types';
import { AdminPaymentFiltersSchema } from '@/lib/types';
import { getAdminPaymentHistory } from '@/lib/services/adminService';

export default function AdminPaymentsPage() {
  const [paymentRecords, setPaymentRecords] = useState<AdminPaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AdminPaymentFiltersFormValues>({
    resolver: zodResolver(AdminPaymentFiltersSchema),
    defaultValues: {
      studentIdOrName: '',
      dateFrom: undefined,
      dateTo: undefined,
    },
  });

  const fetchPaymentRecords = async (filters?: AdminPaymentFiltersFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminPaymentHistory(filters);
      setPaymentRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Payments", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRecords(form.getValues());
  }, []);

  const onSubmitFilters = (values: AdminPaymentFiltersFormValues) => {
    fetchPaymentRecords(values);
  };

  const handleClearFilters = () => {
    form.reset({ studentIdOrName: '', dateFrom: undefined, dateTo: undefined });
    fetchPaymentRecords();
  };

  const handleExportCSV = () => {
    toast({ title: "Export to CSV (Placeholder)", description: "This feature will download the current payment history view as a CSV file." });
  };
  
  const handleViewDetails = (record: AdminPaymentRecord) => {
    toast({ title: "View Payment Details (Placeholder)", description: `Viewing details for transaction ID: ${record.transactionId || record.id}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        icon={History}
        description="View and filter all student payment records."
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
                name="studentIdOrName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID or Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., S10234 or Aisha Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Date From</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} buttonClassName="w-full"/>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Date To</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} buttonClassName="w-full" />
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
          <CardTitle>Payment Records List</CardTitle>
          <Button variant="outline" onClick={handleExportCSV} disabled={paymentRecords.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[12%] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="w-[18%] text-xs uppercase font-medium text-muted-foreground">Student Name</TableHead>
                  <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="w-[10%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Payments</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && paymentRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Payment Records Found</p>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}

          {!isLoading && !error && paymentRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[12%] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="w-[18%] text-xs uppercase font-medium text-muted-foreground">Student Name</TableHead>
                  <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="hidden md:table-cell w-[15%] text-xs uppercase font-medium text-muted-foreground">Payment Method</TableHead>
                  <TableHead className="w-[10%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(parseISO(record.paymentDate), "do MMM, yyyy, p")}</TableCell>
                    <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell className="text-right font-medium">{record.amountPaid.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="hidden md:table-cell">{record.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)} className="text-xs">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
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
