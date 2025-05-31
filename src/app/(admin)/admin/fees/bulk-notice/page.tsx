
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Mail, PlusCircle, Loader2, AlertCircle as AlertIcon, Eye, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker'; 
import type { BulkFeeNoticeDefinition, BulkFeeNoticeFormValues } from '@/lib/types';
import { BulkFeeNoticeFormSchema } from '@/lib/types';
import { getAdminGeneratedFeeNotices, createAdminBulkFeeNotice } from '@/lib/services/adminService';

export default function AdminBulkFeeNoticesPage() {
  const [notices, setNotices] = useState<BulkFeeNoticeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BulkFeeNoticeFormValues>({
    resolver: zodResolver(BulkFeeNoticeFormSchema),
    defaultValues: {
      noticeTitle: '',
      description: '',
      amount: '' as any, // Initialized as string for controlled input, Zod coerces
      dueDate: undefined,
      targetClasses: '',
      additionalNotes: '',
    },
  });

  const fetchNotices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminGeneratedFeeNotices();
      setNotices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Notices", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleGenerateNotice = async (values: BulkFeeNoticeFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminBulkFeeNotice(values);
      toast({ title: "Success", description: "Bulk fee notice generated successfully." });
      setIsFormDialogOpen(false);
      form.reset({
        noticeTitle: '',
        description: '',
        amount: '' as any,
        dueDate: undefined,
        targetClasses: '',
        additionalNotes: '',
      });
      await fetchNotices(); // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate notice.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewStatus = (notice: BulkFeeNoticeDefinition) => {
    toast({
      title: "View Status (Placeholder)",
      description: `Viewing status for notice: ${notice.noticeTitle}. This would show distribution details.`,
    });
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Fee Notices"
        icon={Mail}
        description="Generate and manage fee notices for multiple classes or sections."
        actions={
          <Button onClick={() => { form.reset({ noticeTitle: '', description: '', amount: '' as any, dueDate: undefined, targetClasses: '', additionalNotes: '' }); setIsFormDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Bulk Notice
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Previously Generated Bulk Notices</CardTitle>
          <CardDescription>Overview of all bulk fee notices that have been created.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Target Classes</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Notices</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && notices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Bulk Notices Generated Yet</p>
              <p>Click "Generate New Bulk Notice" to create your first one.</p>
            </div>
          )}

          {!isLoading && !error && notices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Target Classes</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Generated</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="font-medium">{notice.noticeTitle}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-pre-line">{notice.targetClasses}</TableCell>
                    <TableCell className="text-right font-medium">{notice.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{format(new Date(notice.dueDate), "do MMM, yyyy")}</TableCell>
                    <TableCell>{format(parseISO(notice.generatedDate), "do MMM, yyyy, p")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewStatus(notice)}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Bulk Fee Notice</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a fee notice for multiple classes/sections.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateNotice)} className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="noticeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Term 2 Fees 2024-25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the fee notice..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1.5">Due Date</FormLabel>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      />
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="targetClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Classes/Sections</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter one class/section per line, e.g.,&#10;Class 10 - Section A&#10;Class 9 - All Sections&#10;Class 5 - Section B"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      List each target class or section on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other relevant information for parents/students..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Notice
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

