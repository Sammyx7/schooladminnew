
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Download, FileText, AlertCircle as AlertIcon, Loader2, Info } from 'lucide-react'; // Renamed AlertCircle
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { Circular } from '@/lib/types';
import { getStudentCirculars } from '@/lib/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const CircularCardSkeleton = () => (
  <Card className="border shadow-md">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-32" />
    </CardFooter>
  </Card>
);

export default function StudentCircularsPage() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentCirculars("S10234"); // Using mock student ID
        setCirculars(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching circulars.");
        }
        console.error("Failed to fetch circulars:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewAttachment = (circular: Circular) => {
    if (circular.attachmentLink && circular.attachmentLink !== '#') {
      window.open(circular.attachmentLink, '_blank');
    } else {
      toast({
        title: "No Attachment",
        description: `The circular "${circular.title}" does not have a viewable attachment.`,
        variant: "default" 
      });
    }
  };
  
  const getCategoryBadgeClassName = (category?: Circular['category']): string => {
    switch (category) {
        case 'Urgent':
            return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-700';
        case 'Events': 
            return 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/50';
        case 'Academics':
            return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-400 dark:border-blue-700';
        case 'Holidays':
            return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-400 dark:border-green-700';
        default: 
            return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600';
    }
  };


  return (
    <div className="space-y-6 py-4 md:py-6 lg:py-8">
      <PageHeader
        title="School Circulars & Notices"
        description="Stay updated with the latest announcements from the school."
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <CircularCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mt-4">
          <AlertIcon className="h-5 w-5" />
          <AlertMsgTitle>Error Fetching Circulars</AlertMsgTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && circulars.length === 0 && (
        <Card className="border shadow-md">
            <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
                <Info className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Circulars Found</p>
                <p>There are no new circulars or notices at the moment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && circulars.length > 0 && (
        <div className="space-y-6">
          {circulars.map((circular) => (
            <Card key={circular.id} className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <CardTitle className="text-lg font-medium mb-1 sm:mb-0">{circular.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {circular.category && (
                      <Badge className={cn("text-xs", getCategoryBadgeClassName(circular.category))}>
                        {circular.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(parseISO(circular.date), "do MMMM, yyyy")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{circular.summary}</p>
              </CardContent>
              {circular.attachmentLink && (
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAttachment(circular)}
                    className="ml-auto border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Attachment
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
