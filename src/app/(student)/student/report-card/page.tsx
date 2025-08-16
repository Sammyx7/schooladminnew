
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, AlertCircle as AlertIcon, Printer, Info } from 'lucide-react';
import type { ReportCardData } from '@/lib/types';
import { getStudentReportCard } from '@/lib/services/studentService';
import { Button } from '@/components/ui/button';

export default function StudentReportCardPage() {
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MOCK_STUDENT_ID = "S10234";

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentReportCard(MOCK_STUDENT_ID);
        setReportCard(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({ title: "Error Fetching Report Card", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
  const handlePrint = () => {
    window.print();
  }

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader
                title="My Report Card"
                icon={GraduationCap}
                description="Your academic performance for the latest term."
            />
            <Card className="border shadow-md">
                <CardHeader>
                    <Skeleton className="h-7 w-48 mb-1" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (error) {
    return <Alert variant="destructive"><AlertIcon className="h-5 w-5" /><AlertMsgTitle>Error</AlertMsgTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (!reportCard) {
    return (
        <div className="space-y-6">
        <PageHeader title="My Report Card" icon={GraduationCap} description="Your academic performance for the latest term." />
        <Card className="border shadow-md">
            <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                    <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Report Card Not Generated</p>
                    <p>Your report card for the current term is not yet available. Please check back later.</p>
                </div>
            </CardContent>
        </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Report Card"
        icon={GraduationCap}
        description={`Your academic performance for the ${reportCard.examName}.`}
        actions={<Button onClick={handlePrint} variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>}
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>{reportCard.examName} - Performance Summary</CardTitle>
          <CardDescription>Detailed marks for each subject.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
                <TableHead className="text-center text-xs uppercase font-medium text-muted-foreground">Marks Obtained</TableHead>
                <TableHead className="text-center text-xs uppercase font-medium text-muted-foreground">Max Marks</TableHead>
                <TableHead className="text-center text-xs uppercase font-medium text-muted-foreground">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportCard.subjects.map((subject) => (
                <TableRow key={subject.name}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="text-center">{subject.marksObtained}</TableCell>
                  <TableCell className="text-center">{subject.maxMarks}</TableCell>
                  <TableCell className="text-center font-semibold">{subject.grade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-foreground">Total</TableHead>
                    <TableHead className="text-center font-bold text-foreground">{reportCard.totalMarks}</TableHead>
                    <TableHead className="text-center font-bold text-foreground">{reportCard.maxTotalMarks}</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableFooter>
          </Table>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-background">
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">PERCENTAGE</CardDescription>
                    <CardTitle className="text-2xl text-primary">{reportCard.percentage.toFixed(2)}%</CardTitle>
                </CardHeader>
            </Card>
             <Card className="bg-background">
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">OVERALL GRADE</CardDescription>
                    <CardTitle className="text-2xl text-primary">{reportCard.overallGrade}</CardTitle>
                </CardHeader>
            </Card>
          </div>
           <div className="mt-6">
                <h4 className="font-semibold text-foreground mb-2">Teacher's Remarks</h4>
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">{reportCard.teacherRemarks}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
