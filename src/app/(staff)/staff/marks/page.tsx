
"use client";

import { useState, type ChangeEvent } from 'react';
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
import { ClipboardEdit, Search, Loader2, User, Save, AlertCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { StudentProfile, MarksEntryFilterFormValues, MarksEntryData } from '@/lib/types';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';

import { MarksEntryFilterSchema } from '@/lib/types';
import { getStudentsForClassSection } from '@/lib/services/staffService'; // Assuming this service fetches students based on class and section


// Mock data for dropdowns
const MOCK_CLASSES = ['Class 9', 'Class 10'];
const MOCK_SECTIONS = ['Section A', 'Section B'];
const MOCK_SUBJECTS = ['Mathematics', 'Physics', 'Computer Science'];
const MOCK_EXAMS = ['Mid-Term Exam', 'Annual Exam'];

// Define a valid marks range (e.g., 0 to 100)
const MIN_MARKS = 0;
const MAX_MARKS = 100;

interface StudentMarks {
  [studentId: string]: {
    obtained?: number | string; // Changed to allow empty string for input
  };
}


export default function StaffMarksEntryPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [marks, setMarks] = useState<StudentMarks>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearched, setIsSearched] = useState(false); // To show the table after search
  const [hasError, setHasError] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false); // To track if a draft has been loaded
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<{[studentId: string]: string}>({});

  const form = useForm<MarksEntryFilterFormValues>({
    resolver: zodResolver(MarksEntryFilterSchema),
    defaultValues: { class: '', section: '', subject: '', exam: '' },
  });

  // Effect to load draft from local storage on mount
  useState(() => {
    const savedDraft = localStorage.getItem('staffMarksDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Only load draft if no search has been performed yet
        if (!isSearched) {
          form.reset(draftData.criteria);
          setMarks(draftData.marks);
          setStudents(draftData.students || []); // Load students if they were saved in the draft
          setIsSearched(true); // Assume draft means we've "searched"
          setIsDraftLoaded(true);
          toast({ title: "Draft Loaded", description: "A previously saved draft has been loaded." });
        }
      } catch (error) {
        console.error("Failed to load draft from local storage:", error);
        localStorage.removeItem('staffMarksDraft'); // Clear invalid draft
      }
    }
  }, []); // Run only on mount

  const handleSaveDraft = () => {
    const currentDraft = {
      criteria: form.getValues(),
      marks: marks,
      students: students, // Save students in the draft to avoid re-fetching on load
    };
    try {
      localStorage.setItem('staffMarksDraft', JSON.stringify(currentDraft));
      toast({ title: "Draft Saved", description: "Your progress has been saved locally." });
    } catch (error) {
      console.error("Failed to save draft to local storage:", error);
      toast({ title: "Error Saving Draft", description: "Could not save your progress.", variant: "destructive" });
    }
  };


  const handleFindStudents = async (values: MarksEntryFilterFormValues) => {
    setIsLoading(true);
    setIsSearched(true);
    setStudents([]);
    setHasError(false);
    setValidationErrors({}); // Clear validation errors on new search
    setMarks({}); // Reset marks on new search
    try {
      // Simulate API call
      const fetchedStudents = await getStudentsForClassSection(values.class, values.section); // Assume this returns StudentProfile[]
      setStudents(fetchedStudents);
      if (fetchedStudents.length === 0) {

        toast({ title: "No Students Found", description: "No students were found for the selected class and section." });
      }
    } catch (error) {
      setHasError(true);
      toast({ title: "Error", description: "Failed to fetch students.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarksChange = (studentId: string, value: string) => {
    // Allow empty string for clearing input
    if (value.trim() === '') {
       value = '';
    }
    // Basic validation: check if it's a number and within range
    const numValue = Number(value);
    let error = '';
    if (value !== '' && (isNaN(numValue) || numValue < MIN_MARKS || numValue > MAX_MARKS)) {
      error = `Marks must be between ${MIN_MARKS} and ${MAX_MARKS}.`;
    }

    setMarks(prev => ({
      ...prev, // Use spread to keep previous marks
      [studentId]: {
        obtained: value === '' ? '' : numValue,
      }
    }));

    setValidationErrors(prev => ({
        ...prev,
        [studentId]: error
    }));
  };

  const handleSaveMarks = async () => {
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');
    // Check if any marks have been entered at all
    if (hasValidationErrors) {
        toast({
            title: "Validation Error",
            description: "Please fix the errors in the marks before saving.",
            variant: "destructive"
        });
        return;
    }
     // Check if any marks have been entered at all
    const enteredMarksCount = Object.values(marks).filter(mark => mark.obtained !== '' && mark.obtained !== undefined).length;
    if (enteredMarksCount === 0) {
         toast({
            title: "No Marks Entered",
            description: "Please enter some marks before submitting.",
            variant: "destructive"
        });
        return;
    }

    setIsSaving(true);
     // Filter out students with empty marks if you don't want to save them
    const marksToSubmit = Object.entries(marks).reduce((acc, [studentId, markData]) => {
      if (markData.obtained !== '' && markData.obtained !== undefined) {
        acc[studentId] = { obtained: Number(markData.obtained) }; // Ensure number format for submission
      }
      return acc;
    }, {} as StudentMarks);

    // Simulate API call
    console.log("Submitting marks data:", {
        criteria: form.getValues(),
        marks: marksToSubmit,
    });
    // In a real application, you would send 'marksToSubmit' to your backend
    await new Promise(resolve => setTimeout(resolve, 1200));

    toast({

        title: "Marks Saved Successfully",
        description: "The student marks have been recorded."
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Entry"
        icon={ClipboardEdit}
        description="Select criteria to find students and enter their marks."
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
            {hasError && (
                <CardDescription className="text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Error fetching students. Please try again.
                </CardDescription>
            )}
           
            {!hasError && !isLoading && (
                <>
                <CardTitle>Enter Student Marks</CardTitle>
                <CardDescription className="text-muted-foreground">{`Showing students for ${form.getValues('class')} - ${form.getValues('section')}. Subject: ${form.getValues('subject')}`}</CardDescription>
                </>
            )}
         </CardHeader>
          <CardContent className="relative">
            {isLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Student ID</TableHead>
                    <TableHead className="w-[35%]">Student Name</TableHead>
                    <TableHead className="w-[25%]">Maximum Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && students.length === 0 && !hasError && (
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
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <TooltipProvider delayDuration={100}>
                            <Tooltip open={!!validationErrors[student.studentId]}> {/* Show tooltip if there's a validation error */}
                                <TooltipTrigger asChild>
                                    <Input
                                      type="number"
                                      inputMode="numeric" // Use numeric input mode for better mobile keyboards
                                      pattern="[0-9]*" // Restrict input to digits
                                      placeholder={`Enter marks (${MIN_MARKS}-${MAX_MARKS})`}
                                      className={`max-w-xs ${validationErrors[student.studentId] ? 'border-red-500 focus-visible:ring-red-500' : ''}`} // Add validation styling
                                      value={marks[student.studentId]?.obtained ?? ''}
                                      onChange={(e) => handleMarksChange(student.studentId, e.target.value)}
                                    />
                                </TooltipTrigger>
                                {validationErrors[student.studentId] && <TooltipContent className="bg-red-500 text-white text-sm p-2 rounded-md shadow-lg z-50"><p>{validationErrors[student.studentId]}</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                        />
                      </TableCell>
                    </TableRow>
                     {validationErrors[student.studentId] && (
                         <TableRow>
                           <TableCell colSpan={3} className="py-0">
                             <p className="text-sm text-red-500 mt-1 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> {validationErrors[student.studentId]}</p>
                           </TableCell>
                         </TableRow>)}
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

           {!isLoading && students.length > 0 && !hasError && (
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
              {isSaving && (
                <div className="flex items-center text-muted-foreground mr-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </div>
              )}
                <Button
                    onClick={handleSaveMarks}
                    disabled={isSaving || Object.values(validationErrors).some(error => error !== '') || Object.values(marks).filter(mark => mark.obtained !== '' && mark.obtained !== undefined).length === 0} // Disable if saving, validation errors, or no marks entered
                >
                    <Save className="mr-2 h-4 w-4" /> Save Marks
                </Button>
            </CardFooter>
           )}

        </Card>
      )}
    </div>
  );
}

    
    