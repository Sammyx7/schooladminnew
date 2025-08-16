
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, Loader2, Save, User, AlertCircle as AlertIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { StaffOnboardingFormValues, AdminStaffListItem } from '@/lib/types';
import { StaffOnboardingFormSchema, staffRoles, staffDepartments } from '@/lib/types';
import { getAdminStaffMemberById } from '@/lib/services/adminService';

const EditStaffSkeleton = () => (
    <Card className="border shadow-md">
        <CardHeader>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-24 w-full" />
             <div className="flex justify-end">
                <Skeleton className="h-10 w-28" />
             </div>
        </CardContent>
    </Card>
);


export default function EditStaffPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const staffId = params.id as string;

    const form = useForm<StaffOnboardingFormValues>({
        resolver: zodResolver(StaffOnboardingFormSchema),
        defaultValues: {},
    });

    useEffect(() => {
        if (!staffId) return;
        const fetchStaffData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const staffData = await getAdminStaffMemberById(staffId);
                if (staffData) {
                    form.reset({
                        fullName: staffData.name,
                        email: staffData.email,
                        phone: staffData.phone || '',
                        role: staffData.role,
                        department: staffData.department,
                        qualifications: staffData.qualifications?.join(', ') || ''
                    });
                } else {
                    setError("Staff member not found.");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaffData();
    }, [staffId, form]);

    const handleUpdateStaff = async (values: StaffOnboardingFormValues) => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: "Staff Member Updated",
                description: `${values.fullName}'s details have been successfully updated.`,
            });
            router.push('/admin/staff');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Staff Member"
                icon={Edit}
                description="Update the details for the selected staff member."
            />
            {isLoading && <EditStaffSkeleton />}
            
            {!isLoading && error && (
                 <Alert variant="destructive">
                    <AlertIcon className="h-5 w-5" />
                    <AlertMsgTitle>Error Loading Staff Data</AlertMsgTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateStaff)} className="space-y-8">
                        <Card className="border shadow-md">
                            <CardHeader>
                                <CardTitle>Editing Profile for {form.getValues('fullName')}</CardTitle>
                                <CardDescription>Modify the personal and professional information below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input type="email" placeholder="e.g., jane.doe@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Role / Position</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {staffRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {staffDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="qualifications"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qualifications</FormLabel>
                                        <FormControl><Textarea placeholder="List qualifications, separated by commas..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                         <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                 </Form>
            )}
        </div>
    );
}
