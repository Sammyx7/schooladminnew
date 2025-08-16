
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bus, PlusCircle, Loader2, AlertCircle as AlertIcon, Edit, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { TransportRoute, TransportRouteFormValues } from '@/lib/types';
import { TransportRouteFormSchema } from '@/lib/types';
import { getAdminTransportRoutes, createOrUpdateAdminTransportRoute } from '@/lib/services/adminService';

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const { toast } = useToast();

  const form = useForm<TransportRouteFormValues>({
    resolver: zodResolver(TransportRouteFormSchema),
    defaultValues: {
      routeNumber: '',
      driverName: '',
      driverContact: '',
      vehicleNumber: '',
      capacity: '',
    },
  });

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminTransportRoutes();
      setRoutes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Routes", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenDialog = (route: TransportRoute | null = null) => {
    setEditingRoute(route);
    if (route) {
      form.reset({
        routeNumber: route.routeNumber,
        driverName: route.driverName,
        driverContact: route.driverContact,
        vehicleNumber: route.vehicleNumber,
        capacity: String(route.capacity),
      });
    } else {
      form.reset({ routeNumber: '', driverName: '', driverContact: '', vehicleNumber: '', capacity: '' });
    }
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = async (values: TransportRouteFormValues) => {
    setIsSubmitting(true);
    try {
      await createOrUpdateAdminTransportRoute(values, editingRoute?.id);
      toast({
        title: editingRoute ? "Route Updated" : "Route Added",
        description: `Transport route ${values.routeNumber} has been saved successfully.`
      });
      setIsFormDialogOpen(false);
      await fetchRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save route.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = (route: TransportRoute) => {
    toast({ title: "Delete Route (Placeholder)", description: `Deleting route ${route.routeNumber}.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport Management"
        icon={Bus}
        description="Manage school transport, bus routes, and driver details."
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Route
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Bus Routes</CardTitle>
          <CardDescription>List of all active school bus routes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route No.</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Vehicle No.</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Routes</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && routes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Transport Routes Found</p>
              <p>Click "Add New Route" to create the first one.</p>
            </div>
          )}

          {!isLoading && !error && routes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Route No.</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Driver Name</TableHead>
                  <TableHead className="hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Driver Contact</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Vehicle No.</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Capacity</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.routeNumber}</TableCell>
                    <TableCell>{route.driverName}</TableCell>
                    <TableCell className="hidden md:table-cell">{route.driverContact}</TableCell>
                    <TableCell className="font-mono text-sm">{route.vehicleNumber}</TableCell>
                    <TableCell className="text-right">{route.capacity}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(route)}>
                        <Edit className="h-4 w-4" /> <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteRoute(route)}>
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
    </div>
  );
}
