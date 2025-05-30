
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  UserCircle,
  Receipt,
  FileSearch,
  CalendarDays,
  Megaphone,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Edit3,
  Loader2,
  AlertCircle as AlertIcon,
  FlaskConical, // Placeholder for Physics
  BookOpen, // Placeholder for English
  Calculator, // Placeholder for Maths
} from 'lucide-react';
import type { StudentDashboardData, StudentNotification, QuickLink, NextClass } from '@/lib/types';
import { getStudentDashboardData } from '@/lib/services/studentService';
import { cn } from '@/lib/utils';
import { format, parse, differenceInMinutes, differenceInHours, isToday, isFuture } from 'date-fns';

const QuickLinkCard = ({ title, href, icon: Icon, description }: QuickLink) => (
  <Link href={href} className="group block">
    <Card className="h-full border shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Icon className="h-7 w-7 text-primary mb-2" />
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const CountdownTimer = ({ timeString }: { timeString: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!timeString) return;

    // Assuming timeString is "HH:mm AM/PM" e.g., "11:00 AM"
    // We need to parse this into a Date object for today
    const now = new Date();
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period && period.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (period && period.toLowerCase() === 'am' && hours === 12) hours = 0; // Midnight case

    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (!isFuture(targetTime)) {
      setTimeLeft("Class has started or passed");
      return;
    }

    const calculateTimeLeft = () => {
      const current = new Date();
      const totalMinutesLeft = differenceInMinutes(targetTime, current);

      if (totalMinutesLeft <= 0) {
        setTimeLeft("Class starting now / has started");
        clearInterval(intervalId);
        return;
      }

      const hoursLeft = Math.floor(totalMinutesLeft / 60);
      const minutesLeft = totalMinutesLeft % 60;

      let countdownText = "Starts in ";
      if (hoursLeft > 0) {
        countdownText += `${hoursLeft}h `;
      }
      if (minutesLeft > 0 || hoursLeft === 0) { // Show minutes if there are any, or if it's less than an hour
        countdownText += `${minutesLeft}m`;
      }
      setTimeLeft(countdownText.trim());
    };

    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [timeString]);

  if (!timeLeft) return null;
  return <span className="text-sm text-muted-foreground">{timeLeft}</span>;
};


const getSubjectIcon = (subjectName?: string): React.ElementType => {
  if (!subjectName) return BookOpen; // Default icon
  const lowerSubject = subjectName.toLowerCase();
  if (lowerSubject.includes('physics')) return FlaskConical;
  if (lowerSubject.includes('math')) return Calculator;
  if (lowerSubject.includes('english')) return BookOpen;
  // Add more subject to icon mappings as needed
  return BookOpen;
};


export default function StudentProfilePage() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const data = await getStudentDashboardData("S10234"); // Default student
      // const data = await getStudentDashboardData("S10235"); // Student with no pending fees
      const data = await getStudentDashboardData("S10236"); // Student with overdue fees
      // const data = await getStudentDashboardDataWithError(); // To test error state
      setDashboardData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickLinks: QuickLink[] = [
    { title: 'My Timetable', href: '/student/timetable', icon: CalendarDays, description: 'View your weekly class schedule.' },
    { title: 'Fee Notices', href: '/student/fee-notices', icon: Receipt, description: 'Check outstanding fees and payment deadlines.' },
    { title: 'Report Card', href: '/student/report-card', icon: FileSearch, description: 'Access your academic performance reports.' },
    { title: 'School Circulars', href: '/student/circulars', icon: Megaphone, description: 'Stay updated with school announcements.' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Welcome Skeleton */}
        <Card className="border shadow-md">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
        </Card>
        {/* Info Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border shadow-md">
              <CardHeader>
                <Skeleton className="h-5 w-1/3 mb-1" />
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Quick Links Skeleton */}
        <div>
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border shadow-md">
                <CardHeader><Skeleton className="h-7 w-8 mb-2" /><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-1" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Notifications Skeleton */}
        <div>
          <Skeleton className="h-7 w-48 mb-4" />
          <Card className="border shadow-md">
            <CardContent className="pt-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50">
                  <Skeleton className="h-5 w-5 rounded-full mt-1" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertIcon className="h-5 w-5" />
        <AlertMsgTitle>Error Fetching Dashboard Data</AlertMsgTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchDashboardData} variant="link" className="p-0 h-auto ml-2 text-destructive-foreground underline">Try Again</Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return <p>No dashboard data available.</p>; // Should ideally not be reached if loading/error states are handled
  }

  const { profile, pendingFees, nextClass, notifications } = dashboardData;
  const NextClassIcon = getSubjectIcon(nextClass.subject);


  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Welcome Section */}
        <Card className="border shadow-md bg-card overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-muted/30">
            <Avatar className="h-20 w-20 border-2 border-primary shadow-sm">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="student avatar" />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary font-semibold">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {profile.name.split(' ')[0]}!</h1>
              <p className="text-sm text-muted-foreground">
                Student ID: {profile.studentId} <span className="mx-1.5">|</span> Class: {profile.classSection}
              </p>
            </div>
            <Link href="/student/settings" legacyBehavior>
              <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/5 hover:text-primary shrink-0">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </CardHeader>
        </Card>

        {/* Info Cards: Pending Fees & Next Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={cn(
            "border shadow-md flex flex-col",
            pendingFees.status === 'pending' && "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50",
            pendingFees.status === 'overdue' && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700/50"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Pending Fees</CardTitle>
                {pendingFees.status !== 'none' && (
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className={cn(
                        "h-6 w-6",
                        pendingFees.status === 'pending' && "text-yellow-500",
                        pendingFees.status === 'overdue' && "text-red-600"
                      )} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{pendingFees.status === 'overdue' ? 'Urgent: Payment Overdue!' : 'Payment Pending'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {pendingFees.status !== 'none' ? (
                <>
                  <p className="text-3xl font-bold text-foreground">₹{pendingFees.amount}</p>
                  <p className={cn(
                    "text-sm mt-1",
                    pendingFees.status === 'pending' && "text-yellow-700 dark:text-yellow-400",
                    pendingFees.status === 'overdue' && "text-red-700 dark:text-red-400"
                  )}>
                    Due by: {pendingFees.dueDate}
                  </p>
                </>
              ) : (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <p className="text-lg font-medium">All clear! No pending fees.</p>
                </div>
              )}
            </CardContent>
            {pendingFees.status !== 'none' && (
              <CardFooter className="pt-3 border-t">
                <Link href="/student/fee-notices" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Receipt className="mr-2 h-4 w-4" /> View Details & Pay
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>

          <Card className="border shadow-md flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">Next Class</CardTitle>
                    <Clock className="h-6 w-6 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                    <NextClassIcon className="h-7 w-7 text-primary" />
                    <p className="text-2xl font-semibold text-foreground">{nextClass.subject}</p>
                </div>
                <p className="text-sm text-muted-foreground">Teacher: {nextClass.teacher}</p>
                <p className="text-sm text-muted-foreground">Time: {nextClass.time}</p>
                 {nextClass.time && <CountdownTimer timeString={nextClass.time} />}
            </CardContent>
            <CardFooter className="pt-3 border-t">
                <Link href="/student/timetable" className="w-full">
                    <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/5 hover:text-primary">
                        <CalendarDays className="mr-2 h-4 w-4" /> View Full Timetable
                    </Button>
                </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Links Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-2">
            {quickLinks.map((link) => (
              <QuickLinkCard key={link.title} {...link} />
            ))}
          </div>
        </div>

        {/* Recent Activity/Notifications Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Recent Activity</h2>
          <Card className="border shadow-md">
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <Link href={notification.href} className="block hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 p-4">
                          {!notification.read && (
                            <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread"></span>
                          )}
                          <div className={cn("flex-1", notification.read && "ml-[calc(0.625rem_+_0.75rem)]")}> {/* 0.625rem is width of dot, 0.75rem is gap */}
                            <p className="text-sm font-medium text-foreground leading-snug">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.date}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity or notifications at the moment.</p>
                </div>
              )}
            </CardContent>
            {notifications.length > 0 && (
                 <CardFooter className="border-t pt-3 pb-3">
                    <Link href="/student/circulars" className="ml-auto">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View All Notifications <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                 </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

    