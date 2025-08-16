
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { TransportRoute, TransportRouteFormValues } from '@/lib/types';
import { TransportRouteFormSchema } from '@/lib/types';
import { createOrUpdateAdminTransportRoute } from '@/lib/services/adminService';

interface AddTransportRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: () => void;
  editingRoute: TransportRoute | null;
}

export default function AddTransportRouteDialog({ isOpen, onClose, onRouteAdded, editingRoute }: AddTransportRouteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransportRouteFormValues>({
    resolver: zodResolver(TransportRouteFormSchema),
  });

  useEffect(() => {
    if (editingRoute) {
      form.reset({
        routeNumber: editingRoute.routeNumber,
        driverName: editingRoute.driverName,
        driverContact: editingRoute.driverContact,
        vehicleNumber: editingRoute.vehicleNumber,
        capacity: String(editingRoute.capacity),
      });
    } else {
      form.reset({ routeNumber: '', driverName: '', driverContact: '', vehicleNumber: '', capacity: '' });
    }
  }, [editingRoute, form, isOpen]);

  const handleFormSubmit = async (values: TransportRouteFormValues) => {
    setIsSubmitting(true);
    try {
      await createOrUpdateAdminTransportRoute(values, editingRoute?.id);
      toast({
        title: editingRoute ? "Route Updated" : "Route Added",
        description: `Transport route ${values.routeNumber} has been saved successfully.`
      });
      onRouteAdded();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save route.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingRoute ? 'Edit' : 'Add'} Transport Route</DialogTitle>
          <DialogDescription>
            Fill in the details below to {editingRoute ? 'update the' : 'create a new'} bus route.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="routeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Number</FormLabel>
                  <FormControl><Input placeholder="e.g., R-05" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Suresh Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Contact</FormLabel>
                    <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Number</FormLabel>
                    <FormControl><Input placeholder="e.g., MH 12 AB 3456" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 40" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Route
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
