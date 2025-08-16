
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bus, PlusCircle, AlertCircle as AlertIcon, Edit, Trash2 } from 'lucide-react';
import type { TransportRoute } from '@/lib/types';
import { getAdminTransportRoutes } from '@/lib/services/adminService';
import dynamic from 'next/dynamic';

const AddTransportRouteDialog = dynamic(() => import('@/components/admin/transport/AddTransportRouteDialog'), { ssr: false });


export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const { toast } = useToast();

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
    setIsFormDialogOpen(true);
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

      {isFormDialogOpen && (
          <AddTransportRouteDialog 
            isOpen={isFormDialogOpen}
            onClose={() => setIsFormDialogOpen(false)}
            onRouteAdded={fetchRoutes}
            editingRoute={editingRoute}
          />
      )}
    </div>
  );
}
