
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const OnboardingFormSchema = z.object({
  // Personal Details
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  
  // Professional Details
  role: z.string().min(2, { message: "Role is required." }),
  department: z.string().min(2, { message: "Department is required." }),
  qualifications: z.string().min(2, { message: "Please list at least one qualification." }),

  // Document Upload (Placeholder)
  // In a real app, this would use a file upload schema
  resume: z.any().optional(),
  certificates: z.any().optional(),
});

type OnboardingFormValues = z.infer<typeof OnboardingFormSchema>;

export default function AdminTeacherOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      qualifications: '',
    },
  });

  const handleOnboardTeacher = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    // Simulate API call to onboard the new teacher
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Onboarding Data:", values);

    toast({
      title: "Teacher Onboarded Successfully",
      description: `${values.fullName} has been added to the staff list.`,
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Onboarding"
        icon={UserPlus}
        description="Onboard new teachers, collect information, and manage qualifications."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOnboardTeacher)} className="space-y-8">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter the new teacher's personal contact information.</CardDescription>
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
              <CardDescription>Enter the new teacher's role, department, and qualifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Position</FormLabel>
                      <FormControl><Input placeholder="e.g., Science Teacher" {...field} /></FormControl>
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
                          <SelectItem value="Academics - Primary">Academics - Primary</SelectItem>
                          <SelectItem value="Academics - Senior Secondary">Academics - Senior Secondary</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
              Onboard Teacher
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
