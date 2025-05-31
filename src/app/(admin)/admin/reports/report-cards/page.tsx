
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Printer, Filter, Loader2, AlertCircle as AlertIcon, User, FileText, Download, Search } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Mock data - in a real app, this would come from a service
const MOCK_CLASSES = ['Class 1', 'Class 2', 'Class 5', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const MOCK_SECTIONS = ['Section A', 'Section B', 'Section C', 'Commerce', 'Science', 'Arts'];
const MOCK_STUDENTS_FOR_REPORT = [
  { id: 'S1001', name: 'Aarav Sharma', status: 'Generated' },
  { id: 'S1002', name: 'Priya Patel', status: 'Generated' },
  { id: 'S1003', name: 'Rohan Kumar', status: 'Pending Generation' },
  { id: 'S1004', name: 'Sneha Reddy', status: 'Generated' },
  { id: 'S1005', name: 'Vikram Singh', status: 'Error' },
];

const ReportFiltersSchema = z.object({
  class: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  term: z.string().min(1, "Please select a term."),
});

type ReportFiltersFormValues = z.infer<typeof ReportFiltersSchema>;

interface GeneratedStudentReport {
  id: string;
  name: string;
  status: 'Generated' | 'Pending Generation' | 'Error' | 'Not Found';
}

export default function AdminReportCardsPage() {
  const [generatedReports, setGeneratedReports] = useState<GeneratedStudentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFiltersFormValues>({
    resolver: zodResolver(ReportFiltersSchema),
    defaultValues: { class: '', section: '', term: '' },
  });

  const handleGeneratePreview = async (values: ReportFiltersFormValues) => {
    setIsLoading(true);
    setIsSearched(true);
    setGeneratedReports([]); // Clear previous results
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate fetching students for the selected class/section
    // In a real app, you'd fetch this from a backend
    if (values.class === 'Class 10' && values.section === 'Section A') {
      setGeneratedReports(MOCK_STUDENTS_FOR_REPORT);
    } else if (values.class === 'Class 5') {
       setGeneratedReports(MOCK_STUDENTS_FOR_REPORT.slice(0,2).map(s => ({...s, name: `${s.name} (Class 5)`})));
    }
     else {
      setGeneratedReports([]);
    }
    setIsLoading(false);
    toast({ title: "Preview Generated", description: `Report card preview for ${values.class} - ${values.section} (${values.term}) is ready.` });
  };

  const handleViewIndividualReport = (studentName: string) => {
    toast({ title: "View Report Card (Demo)", description: `Displaying report card for ${studentName}.` });
  };

  const handleDownloadAll = () => {
    if (generatedReports.filter(r => r.status === 'Generated').length === 0) {
      toast({ title: "No Reports to Download", description: "No generated report cards available for download.", variant: "destructive" });
      return;
    }
    toast({ title: "Download All (Demo)", description: "This would initiate a bulk PDF download of generated report cards." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Card Generation"
        icon={Printer}
        description="Generate, preview, and download student report cards class-wise."
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Report Filters</CardTitle>
          <CardDescription>Select class, section, and term to generate report card previews.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGeneratePreview)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
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
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term/Examination</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Term 1', 'Mid-Term', 'Term 2', 'Annual Exam'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Generate Preview
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isSearched && (
        <Card className="border shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Report Card Preview</CardTitle>
              <CardDescription>
                {form.getValues('class') && form.getValues('section') ?
                  `Showing students for ${form.getValues('class')} - ${form.getValues('section')} (${form.getValues('term')})` :
                  "Please apply filters to see results."
                }
              </CardDescription>
            </div>
            <Button onClick={handleDownloadAll} variant="outline" disabled={isLoading || generatedReports.filter(r => r.status === 'Generated').length === 0}>
              <Download className="mr-2 h-4 w-4" /> Download All Generated
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground">ID</TableHead>
                    <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground">Student Name</TableHead>
                    <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && generatedReports.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Students Found</p>
                <p>No students match the selected criteria or report cards are not yet available.</p>
              </div>
            )}

            {!isLoading && generatedReports.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground">ID</TableHead>
                    <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground">Student Name</TableHead>
                    <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReports.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-0.5 text-xs rounded-full border ${
                            student.status === 'Generated' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700' :
                            student.status === 'Pending Generation' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-400 dark:border-yellow-700' :
                            student.status === 'Error' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700' :
                            'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600'
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {student.status === 'Generated' && (
                          <Button variant="outline" size="sm" onClick={() => handleViewIndividualReport(student.name)}>
                            <FileText className="mr-2 h-3.5 w-3.5" /> View Report
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
       {!isSearched && !isLoading && (
         <Card className="border shadow-md">
            <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Generate Report Card Previews</p>
                <p>Select class, section, and term then click "Generate Preview" to see results.</p>
            </div>
          </CardContent>
        </Card>
       )}
    </div>
  );
}
