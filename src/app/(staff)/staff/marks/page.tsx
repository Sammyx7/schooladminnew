
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ClipboardEdit, Search, Loader2, User, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { StudentProfile, MarksEntryFilterFormValues } from '@/lib/types';
import { MarksEntryFilterSchema } from '@/lib/types';
import { getStudentsForClassSection } from '@/lib/services/staffService';


// Mock data for dropdowns
const MOCK_CLASSES = ['Class 9', 'Class 10'];
const MOCK_SECTIONS = ['Section A', 'Section B'];
const MOCK_SUBJECTS = ['Mathematics', 'Physics', 'Computer Science'];
const MOCK_EXAMS = ['Mid-Term Exam', 'Annual Exam'];

export default function StaffMarksEntryPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const { toast } = useToast();

  const form = useForm<MarksEntryFilterFormValues>({
    resolver: zodResolver(MarksEntryFilterSchema),
    defaultValues: { class: '', section: '', subject: '', exam: '' },
  });

  const handleFindStudents = async (values: MarksEntryFilterFormValues) => {
    setIsLoading(true);
    setIsSearched(true);
    setStudents([]);
    try {
      // Simulate API call
      const fetchedStudents = await getStudentsForClassSection(values.class, values.section);
      setStudents(fetchedStudents);
      if (fetchedStudents.length === 0) {
        toast({ title: "No Students Found", description: "No students were found for the selected class and section." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch students.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMarks = () => {
    toast({
        title: "Marks Saved (Demo)",
        description: "The student marks have been saved successfully."
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Entry"
        icon={ClipboardEdit}
        description="Select class and subject to enter student marks."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
          <CardDescription>Choose the class, subject, and exam to enter marks for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFindStudents)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                      <SelectContent>{MOCK_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl>
                      <SelectContent>{MOCK_SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                      <SelectContent>{MOCK_SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="exam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam/Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger></FormControl>
                      <SelectContent>{MOCK_EXAMS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Find Students
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isSearched && (
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
            <CardDescription>
              {`Showing students for ${form.getValues('class')} - ${form.getValues('section')}. Subject: ${form.getValues('subject')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Student ID</TableHead>
                    <TableHead className="w-[35%]">Student Name</TableHead>
                    <TableHead className="w-[25%]">Marks Obtained</TableHead>
                    <TableHead className="w-[25%]">Maximum Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!isLoading && students.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Students Found</p>
                    <p>There are no students matching your selected criteria.</p>
                </div>
            )}

            {!isLoading && students.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Student Name</TableHead>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Marks Obtained</TableHead>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Maximum Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Input type="number" placeholder="Enter marks" className="max-w-xs" />
                      </TableCell>
                       <TableCell>
                        <Input type="number" placeholder="e.g., 100" className="max-w-xs" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
           {students.length > 0 && (
            <CardFooter>
                <Button onClick={handleSaveMarks} className="ml-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Save Marks
                </Button>
            </CardFooter>
           )}
        </Card>
      )}
    </div>
  );
}
