
"use client";

import { useState, useEffect, useMemo, lazy } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, PlusCircle, AlertCircle as AlertIcon, Download, PieChart, Edit, Trash2 } from 'lucide-react';
import type { ExpenseRecord } from '@/lib/types';
import { getAdminExpenseRecords } from '@/lib/services/adminService';
import dynamic from 'next/dynamic';

const AddExpenseDialog = dynamic(() => import('@/components/admin/expenses/AddExpenseDialog'), { ssr: false });
const ExpenseChart = dynamic(() => import('@/components/admin/expenses/ExpenseChart'), { ssr: false });

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleExportCSV = () => {
    toast({ title: "Export to CSV (Placeholder)", description: "This feature will download expenses as a CSV file." });
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
     toast({ title: "Edit Expense (Placeholder)", description: `Editing: ${expense.description}` });
  }
  const handleDeleteExpense = (expense: ExpenseRecord) => {
     toast({ title: "Delete Expense (Placeholder)", description: `Deleting: ${expense.description}` });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses Management"
        icon={DollarSign}
        description="Track and manage school operational expenses."
        actions={
          <Button onClick={() => setIsFormDialogOpen(true)}>
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
                <ExpenseChart expenses={expenses} />
            </CardContent>
        </Card>
      </div>

      {isFormDialogOpen && (
        <AddExpenseDialog 
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          onExpenseAdded={fetchExpenses}
        />
      )}
    </div>
  );
}
