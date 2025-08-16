
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, PlusCircle, AlertCircle as AlertIcon, Trash2, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Circular, CircularCategory } from '@/lib/types';
import { getAdminCirculars, deleteAdminCircular } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const AddCircularDialog = dynamic(() => import('@/components/admin/circulars/AddCircularDialog'), {
  ssr: false,
});

export default function AdminCircularsPage() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [circularToDelete, setCircularToDelete] = useState<Circular | null>(null);
  const { toast } = useToast();

  const fetchCirculars = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminCirculars();
      setCirculars(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load circulars.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  const handleDeleteCircular = async () => {
    if (!circularToDelete) return;
    try {
      await deleteAdminCircular(circularToDelete.id);
      toast({ title: "Circular Deleted", description: `"${circularToDelete.title}" has been removed.` });
      setCircularToDelete(null);
      await fetchCirculars();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete circular.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleSendNotification = (circular: Circular) => {
     toast({ title: "Send Notification (Placeholder)", description: `Sending notifications for "${circular.title}" via SMS/WhatsApp/Email.`});
  }

  const getCategoryBadgeClassName = (category?: CircularCategory): string => {
    switch (category) {
        case 'Urgent': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
        case 'Events': return 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/50';
        case 'Academics': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700';
        case 'Holidays': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-400 dark:border-green-700';
        default: return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circulars & Notices"
        icon={Megaphone}
        description="Manage and distribute school-wide announcements."
        actions={
          <Button onClick={() => setIsFormDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Circular
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Published Circulars</CardTitle>
          <CardDescription>List of all circulars sent to students, parents, or staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{[...Array(3)].map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-3/4" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-6 w-20" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
          {!isLoading && error && <Alert variant="destructive"><AlertIcon className="h-5 w-5" /><AlertMsgTitle>Error</AlertMsgTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {!isLoading && !error && circulars.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Circulars Published</p>
              <p>Click "Create New Circular" to publish the first one.</p>
            </div>
          )}
          {!isLoading && !error && circulars.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%] text-xs uppercase font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Category</TableHead>
                  <TableHead className="w-[25%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circulars.map((circ) => (
                  <TableRow key={circ.id}>
                    <TableCell className="font-medium">{circ.title}</TableCell>
                    <TableCell>{format(parseISO(circ.date), "do MMM, yyyy")}</TableCell>
                    <TableCell>
                        <Badge className={cn("text-xs", getCategoryBadgeClassName(circ.category))}>
                            {circ.category || 'General'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleSendNotification(circ)}>
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Notify
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
      
      {isFormDialogOpen && (
        <AddCircularDialog 
            isOpen={isFormDialogOpen}
            onClose={() => setIsFormDialogOpen(false)}
            onCircularAdded={fetchCirculars}
        />
      )}
      
      <AlertDialog open={!!circularToDelete} onOpenChange={() => setCircularToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the circular "{circularToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCircular} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
