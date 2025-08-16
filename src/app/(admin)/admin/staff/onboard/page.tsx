
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2, Save, Upload } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from '@/components/ui/separator';
import type { StaffOnboardingFormValues } from '@/lib/types';
import { StaffOnboardingFormSchema, staffRoles, staffDepartments } from '@/lib/types';
import { createAdminStaffMember } from '@/lib/services/adminService';

export default function AdminTeacherOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<StaffOnboardingFormValues>({
    resolver: zodResolver(StaffOnboardingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: undefined,
      department: undefined,
      qualifications: '',
    },
  });

  const handleOnboardTeacher = async (values: StaffOnboardingFormValues) => {
    setIsSubmitting(true);
    try {
      await createAdminStaffMember(values);
      toast({
        title: "Staff Member Onboarded",
        description: `${values.fullName} has been successfully added to the staff list.`,
      });
      form.reset();
      // Optional: redirect to staff list after successful onboarding
      // router.push('/admin/staff'); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Onboarding Failed",
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
        title="Staff Onboarding"
        icon={UserPlus}
        description="Onboard new staff members, collect information, and manage qualifications."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOnboardTeacher)} className="space-y-8">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter the new staff member's personal contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Enter the new staff member's role, department, and qualifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <FormLabel>Qualifications (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="List qualifications, separated by commas (e.g., M.Sc. Physics, B.Ed.)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Document Upload (Placeholder)</CardTitle>
              <CardDescription>Upload necessary documents for verification.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <FormLabel>Resume / CV</FormLabel>
                <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                  <Upload className="mr-2 h-4 w-4" /> Choose file...
                </Button>
                <p className="text-xs text-muted-foreground pt-1">PDF, DOC, DOCX up to 5MB.</p>
              </div>
               <div className="space-y-1.5">
                <FormLabel>Certificates</FormLabel>
                <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                  <Upload className="mr-2 h-4 w-4" /> Choose files...
                </Button>
                 <p className="text-xs text-muted-foreground pt-1">Upload relevant degree/qualification certificates.</p>
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Note: Document upload functionality is a placeholder for demonstration purposes.</p>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Onboard Staff Member
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
