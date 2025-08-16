
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { CreateCircularFormValues } from '@/lib/types';
import { CreateCircularSchema, circularCategories } from '@/lib/types';
import { createAdminCircular } from '@/lib/services/adminService';

interface AddCircularDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCircularAdded: () => void;
}

export default function AddCircularDialog({ isOpen, onClose, onCircularAdded }: AddCircularDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateCircularFormValues>({
    resolver: zodResolver(CreateCircularSchema),
    defaultValues: { title: '', summary: '', category: undefined, attachmentLink: '' },
  });

  const handleCreateCircular = async (values: CreateCircularFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminCircular(values);
      toast({ title: "Success", description: "New circular has been published." });
      form.reset();
      onCircularAdded();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create circular.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Circular</DialogTitle>
          <DialogDescription>Compose and publish a new announcement.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateCircular)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Annual Sports Day Announcement" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Summary / Content</FormLabel><FormControl><Textarea placeholder="Enter the full content of the circular here..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{circularCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="attachmentLink" render={({ field }) => (<FormItem><FormLabel>Attachment URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/document.pdf" {...field} /></FormControl><FormDescription>Provide a link to a PDF or other document if needed.</FormDescription><FormMessage /></FormItem>)} />
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish Circular</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
