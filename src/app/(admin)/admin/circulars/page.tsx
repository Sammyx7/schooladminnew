
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger from here as it's not needed for this fix, but was present.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, PlusCircle, Loader2, AlertCircle as AlertIcon, FileText, Trash2, Edit, Eye } from 'lucide-react';
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
} from "@/components/ui/form";
import type { Circular, CreateCircularFormValues, CircularCategory } from '@/lib/types';
import { CreateCircularSchema, circularCategories } from '@/lib/types';
import { getAdminCirculars, createAdminCircular, deleteAdminCircular } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';

export default function AdminCircularsPage() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [circularToDelete, setCircularToDelete] = useState<Circular | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateCircularFormValues>({
    resolver: zodResolver(CreateCircularSchema),
    defaultValues: {
      title: '',
      summary: '',
      category: undefined,
      attachmentLink: '',
    },
  });

  const fetchCirculars = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminCirculars();
      setCirculars(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Circulars", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  const handleAddCircular = async (values: CreateCircularFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminCircular(values);
      toast({ title: "Success", description: "New circular published successfully." });
      setIsFormDialogOpen(false);
      form.reset();
      await fetchCirculars();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to publish circular.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!circularToDelete) return;
    setIsSubmitting(true); // Can reuse for deletion loading state
    try {
      await deleteAdminCircular(circularToDelete.id);
      toast({ title: "Circular Deleted", description: `"${circularToDelete.title}" has been deleted.` });
      setCircularToDelete(null);
      await fetchCirculars();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete circular.";
      toast({ title: "Error Deleting", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewAttachment = (attachmentLink?: string) => {
    if (attachmentLink) {
      window.open(attachmentLink, '_blank');
    } else {
      toast({ title: "No Attachment", description: "This circular does not have an attachment.", variant: "default" });
    }
  };
  
  const handleEditCircular = (circular: Circular) => {
    toast({ title: "Edit Circular (Placeholder)", description: `Editing: ${circular.title}` });
  };

  const getCategoryBadgeClassName = (category?: CircularCategory): string => {
    switch (category) {
        case 'Urgent':
            return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
        case 'Events': 
            return 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/50';
        case 'Academics':
            return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700';
        case 'Holidays':
            return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-400 dark:border-green-700';
        default: 
            return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circulars & Notices Management"
        icon={Megaphone}
        description="Manage and distribute school circulars and notices."
        actions={
          <Button onClick={() => { form.reset(); setIsFormDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Circular
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Published Circulars</CardTitle>
          <CardDescription>Overview of all published school circulars.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Circulars</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && circulars.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Circulars Published Yet</p>
              <p>Click "Add New Circular" to create the first one.</p>
            </div>
          )}

          {!isLoading && !error && circulars.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Category</TableHead>
                  <TableHead className="w-[30%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Summary</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circulars.map((circ) => (
                  <TableRow key={circ.id}>
                    <TableCell className="font-medium">{circ.title}</TableCell>
                    <TableCell>{format(parseISO(circ.date), "do MMM, yyyy")}</TableCell>
                    <TableCell>
                        {circ.category && <Badge className={cn("text-xs", getCategoryBadgeClassName(circ.category))}>{circ.category}</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">
                      {circ.summary}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                        {circ.attachmentLink && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewAttachment(circ.attachmentLink)}>
                                <Eye className="h-4 w-4 text-primary" /> <span className="sr-only">View Attachment</span>
                            </Button>
                        )}
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCircular(circ)}>
                            <Edit className="h-4 w-4" /> <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setCircularToDelete(circ)}>
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

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Circular</DialogTitle>
            <DialogDescription>
              Fill in the details below to publish a new school circular.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCircular)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Sports Day Announcement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief summary of the circular..." {...field} rows={4}/>
                    </FormControl>
                    <FormMessage />
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {circularCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attachmentLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachment URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/document.pdf" {...field} />
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
                  Publish Circular
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog for delete confirmation remains controlled by circularToDelete state */}
      {circularToDelete && (
        <AlertDialog open={!!circularToDelete} onOpenChange={() => setCircularToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the circular: "{circularToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
