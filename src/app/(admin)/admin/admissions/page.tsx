
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, PlusCircle, Loader2, AlertCircle as AlertIcon, Eye, Edit, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker';
import type { StudentApplication, StudentApplicationFormValues, ApplicationStatus } from '@/lib/types';
import { StudentApplicationFormSchema, applicationStatuses } from '@/lib/types';
import { getAdminStudentApplications, createAdminStudentApplication, updateAdminStudentApplicationStatus } from '@/lib/services/adminService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';


export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StudentApplicationFormValues>({
    resolver: zodResolver(StudentApplicationFormSchema),
    defaultValues: {
      applicantName: '',
      classAppliedFor: '',
      applicationDate: new Date(),
      parentName: '',
      parentEmail: '',
      parentPhone: '',
    },
  });

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminStudentApplications();
      setApplications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ title: "Error Fetching Applications", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAddApplication = async (values: StudentApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminStudentApplication(values);
      toast({ title: "Success", description: "New student application added successfully." });
      setIsFormDialogOpen(false);
      form.reset({ applicationDate: new Date() }); // Reset form with current date
      await fetchApplications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add application.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (application: StudentApplication) => {
    toast({
      title: "View Details (Placeholder)",
      description: `Viewing details for application ID: ${application.id}. This would show full application data.`,
    });
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateAdminStudentApplicationStatus(applicationId, newStatus);
      toast({ title: "Status Updated", description: `Application status changed to ${newStatus}.`});
      await fetchApplications(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status.";
      toast({ title: "Error Updating Status", description: errorMessage, variant: "destructive" });
    }
  };

  const getStatusBadgeClassName = (status: ApplicationStatus): string => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
      case 'Waitlisted':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700/30 dark:text-purple-400 dark:border-purple-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700';
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management"
        icon={UserPlus}
        description="Manage student applications, track progress, and update statuses."
        actions={
          <Button onClick={() => { form.reset({applicationDate: new Date()}); setIsFormDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Application
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Student Applications</CardTitle>
          <CardDescription>Overview of all submitted student applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Applicant Name</TableHead>
                  <TableHead className="w-[20%]">Class Applied For</TableHead>
                  <TableHead className="w-[20%]">Application Date</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="text-right w-[20%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Loading Applications</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && applications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Applications Yet</p>
              <p>Click "Add New Application" to create the first one.</p>
            </div>
          )}

          {!isLoading && !error && applications.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Applicant Name</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class Applied</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.applicantName}</TableCell>
                    <TableCell>{app.classAppliedFor}</TableCell>
                    <TableCell>{format(new Date(app.applicationDate), "do MMM, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs py-1", getStatusBadgeClassName(app.status))}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)} className="text-xs">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                           <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup 
                            value={app.status} 
                            onValueChange={(newStatus) => handleUpdateStatus(app.id, newStatus as ApplicationStatus)}
                          >
                            {applicationStatuses.map((statusOption) => (
                              <DropdownMenuRadioItem key={statusOption} value={statusOption}>
                                {statusOption}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <DialogTitle>Add New Student Application</DialogTitle>
            <DialogDescription>
              Fill in the details below to record a new application.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddApplication)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classAppliedFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Applied For</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Class 5, Nursery" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Application Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      // disabled={(date) => date > new Date()} // Optionally disable future dates
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9876543210" {...field} />
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
                  Add Application
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
