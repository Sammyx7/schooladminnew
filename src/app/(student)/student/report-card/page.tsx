
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Download, Loader2, AlertCircle as AlertIcon, Info } from 'lucide-react'; // Renamed AlertCircle
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportCardData, SubjectGrade } from '@/lib/types';
import { getStudentReportCards } from '@/lib/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

const ReportCardSkeleton = () => (
  <Card className="border shadow-md">
    <CardHeader>
      <Skeleton className="h-7 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead className="text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-16" /></TableHead>
            <TableHead className="hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-16" /></TableHead>
            <TableHead className="hidden md:table-cell text-xs uppercase font-medium text-muted-foreground"><Skeleton className="h-5 w-32" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-12" /></TableCell>
              <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-32" />
    </CardFooter>
  </Card>
);


export default function StudentReportCardPage() {
  const [reportCards, setReportCards] = useState<ReportCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentReportCards("S10234"); // Using mock student ID
        setReportCards(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching report cards.");
        }
        console.error("Failed to fetch report cards:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownload = (report: ReportCardData) => {
    if (report.downloadLink && report.downloadLink !== '#') {
      window.open(report.downloadLink, '_blank');
      toast({
        title: "Download Started (Demo)",
        description: `Downloading report: ${report.termName}`,
      });
    } else {
      toast({
        title: "Download Unavailable",
        description: `The PDF for "${report.termName}" is not available for download at the moment.`,
        variant: "default"
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Report Cards"
        description="View and download your report cards for each term."
      />

      {isLoading && (
        <div className="space-y-6">
          <ReportCardSkeleton />
          <ReportCardSkeleton />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mt-4">
          <AlertIcon className="h-5 w-5" />
          <AlertMsgTitle>Error Fetching Report Cards</AlertMsgTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && reportCards.length === 0 && (
         <Card className="border shadow-md">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
                <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Report Cards Found</p>
                <p>Your report cards will appear here once they are published.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && reportCards.length > 0 && (
        <div className="space-y-8">
          {reportCards.map((report) => (
            <Card key={report.id} className="border shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <CardTitle className="text-xl font-semibold">{report.termName}</CardTitle>
                  <Badge variant="outline" className="text-xs py-1 px-2.5 w-fit">
                    Issued: {format(parseISO(report.issueDate), "do MMMM, yyyy")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%] sm:w-[30%] text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
                      <TableHead className="w-[15%] text-center text-xs uppercase font-medium text-muted-foreground">Grade</TableHead>
                      <TableHead className="w-[20%] text-center hidden sm:table-cell text-xs uppercase font-medium text-muted-foreground">Marks</TableHead>
                      <TableHead className="w-[30%] sm:w-[35%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell className="text-center font-semibold">{subject.grade}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {subject.marks !== undefined && subject.maxMarks !== undefined
                            ? `${subject.marks}/${subject.maxMarks}`
                            : subject.marks !== undefined
                              ? `${subject.marks}`
                              : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                          {subject.remarks || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 space-y-3">
                  { (report.overallPercentage || report.overallGrade) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded-md border">
                        {report.overallPercentage && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Overall Percentage</p>
                                <p className="text-lg font-semibold text-primary">{report.overallPercentage}</p>
                            </div>
                        )}
                        {report.overallGrade && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Overall Grade</p>
                                <p className="text-lg font-semibold text-primary">{report.overallGrade}</p>
                            </div>
                        )}
                        {report.classRank && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Class Rank</p>
                                <p className="text-lg font-semibold text-primary">{report.classRank}</p>
                            </div>
                        )}
                    </div>
                  )}
                  {report.teacherComments && (
                    <div>
                      <h4 className="font-semibold text-md mb-1">Teacher's Comments:</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-md border border-dashed">
                        {report.teacherComments}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              {report.downloadLink && (
                <CardFooter className="border-t pt-4">
                  <Button onClick={() => handleDownload(report)} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
