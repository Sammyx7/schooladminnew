
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, PlusCircle, Loader2, AlertCircle as AlertIcon, Download, PieChart, Edit, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ExpenseRecord, ExpenseFormValues, ExpenseCategory } from '@/lib/types';
import { ExpenseFormSchema, expenseCategories } from '@/lib/types';
import { getAdminExpenseRecords, createAdminExpenseRecord, deleteAdminExpense } from '@/lib/services/expensesService';
import { cn } from '@/lib/utils';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: {
      date: new Date(),
      category: undefined, // Will be set by Select
      description: '',
      amount: '', // Initialize as empty string for controlled input
      paymentMethod: '',
    },
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminExpenseRecords();
      setExpenses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Expenses", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminExpenseRecord(values);
      toast({ title: "Success", description: "New expense recorded successfully." });
      setIsFormDialogOpen(false);
      form.reset({ date: new Date(), category: undefined, description: '', amount: '', paymentMethod: '' });
      await fetchExpenses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add expense.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExportCSV = () => {
    toast({ title: "Export to CSV (Placeholder)", description: "This feature will download expenses as a CSV file." });
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
     toast({ title: "Edit Expense (Placeholder)", description: `Editing: ${expense.description}` });
  }
  const handleDeleteExpense = (expense: ExpenseRecord) => {
     (async () => {
       setIsSubmitting(true);
       try {
         await deleteAdminExpense(expense.id);
         toast({ title: "Expense Deleted", description: `Deleted: ${expense.description}` });
         await fetchExpenses();
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : "Failed to delete expense.";
         toast({ title: "Error", description: errorMessage, variant: "destructive" });
       } finally {
         setIsSubmitting(false);
       }
     })();
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses Management"
        icon={DollarSign}
        description="Track and manage school operational expenses."
        actions={
          <Button onClick={() => { form.reset({ date: new Date(), category: undefined, description: '', amount: '', paymentMethod: '' }); setIsFormDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Expense Records</CardTitle>
            <Button variant="outline" onClick={handleExportCSV} disabled={expenses.length === 0}>
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
                    <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Category</TableHead>
                    <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
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
                <AlertMsgTitle>Error Loading Expenses</AlertMsgTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && expenses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Expenses Recorded Yet</p>
                <p>Click "Add New Expense" to record the first one.</p>
              </div>
            )}

            {!isLoading && !error && expenses.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                    <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Category</TableHead>
                    <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Description</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Amount (₹)</TableHead>
                    <TableHead className="w-[15%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.date), "do MMM, yyyy")}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">{expense.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4" /> <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteExpense(expense)}>
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card className="border shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Expense Chart</CardTitle>
                <CardDescription>Visualization of expense distribution by category.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Chart visualization will be implemented here.</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Fill in the details below to record a new school expense.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Date of Expense</FormLabel>
                    <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        disabled={(date) => date > new Date()} // Disable future dates
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Purchase of new whiteboard markers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cash, Cheque No. 12345" {...field} />
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
                  Add Expense
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
