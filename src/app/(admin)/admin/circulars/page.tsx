
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle as AlertIcon, UserPlus } from 'lucide-react';

// Assuming you have an adminService with a function to fetch admissions data
import { getAdminAdmissions } from '@/lib/services/adminService'; // You'll need to implement this service

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]); // Replace any with your Admission type
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace getAdminAdmissions with your actual data fetching function
      const data = await getAdminAdmissions(); // Implement this
      setAdmissions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      // You might want to add a toast notification here if you have a toast system
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // Render skeleton loader while loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admissions Management"
          icon={UserPlus}
          description="Manage student admissions."
          actions={<Skeleton className="h-10 w-40" />} // Skeleton for button
        />
        <Card className="border shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" /> // Skeleton for table rows or cards
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error message if fetching failed
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admissions Management"
          icon={UserPlus}
          description="Manage student admissions."
          actions={<Button>Add New Admission</Button>}
        />
        <Alert variant="destructive">
          <AlertIcon className="h-5 w-5" />
          <AlertTitle>Error Loading Admissions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions Management"
        icon={UserPlus}
        description="Manage student admissions."
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Admission
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Current Admissions</CardTitle>
          <CardDescription>Overview of all current student admissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {admissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Admissions Found</p>
              <p>Click "Add New Admission" to add a new student.</p>
            </div>
          ) : (
            // Replace this with your actual table or list of admissions
            <div className="space-y-4">
                {admissions.map((admission) => (
                    <div key={admission.id} className="p-4 border rounded-md">
                        <h3 className="font-semibold">{admission.studentName}</h3>
                        <p className="text-sm text-muted-foreground">Applied for: {admission.grade}</p>
                    </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admission Dialog (Placeholder) */}
      {/* You'll need to implement the dialog for adding/editing admissions */}
      {/* <Dialog>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Admission</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new student admission.
            </DialogDescription>
          </DialogHeader>
          {/* Add your form for admission details here */}
          {/* <Form>
            <form className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
                ... form fields ...
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  Add Admission
                </Button>
              </DialogFooter>
            </form>
          </Form> */}
        </DialogContent>
      </Dialog> */}

      {/* Delete Confirmation Dialog (Placeholder) */}
      {/* You'll need to implement the delete functionality and confirmation dialog */}
      {/* <AlertDialog>
        <AlertDialog open={!!circularToDelete} onOpenChange={() => setCircularToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this admission? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )} */}
    </div>
  );
}
