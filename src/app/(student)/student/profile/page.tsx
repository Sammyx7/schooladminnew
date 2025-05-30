
"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CalendarDays, FileText, Megaphone, Receipt, Clock, AlertTriangle, CheckCircle, 
  ArrowRight, Loader2, AlertCircle as AlertIcon, Edit3, UserCog 
} from "lucide-react";
import Link from "next/link";
import { getStudentDashboardData } from "@/lib/services/studentService";
import type { StudentDashboardData, QuickLink, PendingFee } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription as AlertDesc, AlertTitle as AlertMsgTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { format, parse, differenceInMinutes, isFuture, isPast } from 'date-fns';


const quickLinks: QuickLink[] = [
  { title: "My Timetable", href: "/student/timetable", icon: CalendarDays, description: "View your weekly class schedule." },
  { title: "Fee Notices", href: "/student/fee-notices", icon: Receipt, description: "Check your fee status and dues." },
  { title: "Report Card", href: "/student/report-card", icon: FileText, description: "Access your academic reports." },
  { title: "School Circulars", href: "/student/circulars", icon: Megaphone, description: "Read important school announcements." },
];

// Helper function to get initials from name
const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

// Helper function for Next Class Countdown
const getNextClassStatus = (timeString: string): string => {
  if (!timeString) return "Not scheduled";

  // Assuming timeString is like "11:00 AM" or "14:30 PM" (HH:mm a)
  // We need to parse this relative to today.
  const now = new Date();
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period?.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case

  const classDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  if (isPast(classDateTime) && differenceInMinutes(now, classDateTime) > 60) { // Assuming a class lasts about an hour
    return `Finished (was at ${timeString})`;
  }
  if (isPast(classDateTime)) {
    return `Ongoing (started at ${timeString})`;
  }
  if (isFuture(classDateTime)) {
    const diffMinutes = differenceInMinutes(classDateTime, now);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    if (diffHours > 0) {
      return `Starts in ${diffHours}h ${remainingMinutes}m`;
    }
    return `Starts in ${remainingMinutes}m`;
  }
  return `Today at ${timeString}`;
};


const WelcomeSkeleton = () => (
  <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border rounded-lg shadow-md">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-40" />
      </div>
    </div>
    <Skeleton className="h-9 w-28" />
  </section>
);

const InfoCardSkeleton = () => (
  <Card className="border shadow-md bg-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-24 mb-1" />
      <Skeleton className="h-4 w-40 mb-3" />
      <Skeleton className="h-5 w-28" />
    </CardContent>
  </Card>
);

const QuickLinkSkeleton = () => (
  <Card className="border shadow-md hover:shadow-lg transition-all duration-200 ease-in-out bg-card flex flex-col">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-9 w-full mt-auto" />
    </CardContent>
  </Card>
);

const ActivitySkeleton = () => (
 <Card className="border shadow-md bg-card">
    <CardContent className="pt-6 space-y-3">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex items-center justify-between pb-3 border-b last:border-none list-none">
          <div>
            <Skeleton className="h-5 w-64 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </li>
      ))}
    </CardContent>
  </Card>
);


export default function StudentProfilePage() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextClassStatus, setNextClassStatus] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Use "S10236" to test overdue fees, "S10235" for no fees, "S10234" for pending
        const data = await getStudentDashboardData("S10234"); 
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
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (dashboardData?.nextClass?.time) {
      setNextClassStatus(getNextClassStatus(dashboardData.nextClass.time));
      const interval = setInterval(() => {
        setNextClassStatus(getNextClassStatus(dashboardData.nextClass.time));
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [dashboardData?.nextClass?.time]);


  const pendingFeesCardBg = useMemo(() => {
    if (!dashboardData) return "bg-card";
    if (dashboardData.pendingFees.status === 'overdue') return "bg-[hsl(var(--destructive-light-bg))]";
    if (dashboardData.pendingFees.status === 'pending') return "bg-[hsl(var(--warning-light-bg))]";
    return "bg-card";
  }, [dashboardData]);

  const pendingFeesIconColor = useMemo(() => {
    if (!dashboardData) return "text-muted-foreground";
    if (dashboardData.pendingFees.status === 'overdue') return "text-destructive";
    if (dashboardData.pendingFees.status === 'pending') return "text-warning";
    return "text-green-500";
  }, [dashboardData]);


  if (isLoading) {
    return (
      <div className="space-y-8">
        <WelcomeSkeleton />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCardSkeleton />
          <InfoCardSkeleton />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <QuickLinkSkeleton key={i} />)}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
          <ActivitySkeleton />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-lg">
          <AlertIcon className="h-5 w-5" />
          <AlertMsgTitle>Error Fetching Data</AlertMsgTitle>
          <AlertDesc>{error}</AlertDesc>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">No dashboard data available.</p>
      </div>
    );
  }

  const { profile, pendingFees, nextClass, notifications } = dashboardData;
  const IconForNextClass = nextClass.subjectIcon;


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="student avatar" />
            <AvatarFallback className="text-2xl font-medium bg-muted text-muted-foreground">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.name}!</h1>
            <p className="text-md text-muted-foreground">
              {profile.studentId} &bull; {profile.classSection}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="border-primary/50 text-primary hover:bg-primary/5 hover:text-primary">
          <Link href="/student/settings">
            <UserCog className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </section>

      {/* Key Info Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={cn("border shadow-md", pendingFeesCardBg)}>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Pending Fees</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <span className="flex items-center"> {/* Wrapper for icon and alignment */}
                    {(pendingFees.status === 'pending' || pendingFees.status === 'overdue') ? 
                        <AlertTriangle className={cn("h-6 w-6", pendingFeesIconColor)} /> : 
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    }
                   </span>
                </TooltipTrigger>
                {(pendingFees.status === 'pending' || pendingFees.status === 'overdue') && (
                  <TooltipContent>
                    <p>{pendingFees.status === 'overdue' ? "Urgent: Payment Overdue!" : "Payment Pending"}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            {pendingFees.status === 'pending' || pendingFees.status === 'overdue' ? (
              <>
                <p className={cn("text-3xl font-bold", pendingFees.status === 'overdue' ? 'text-destructive' : 'text-amber-600')}>{pendingFees.amount !== "0" ? `₹${pendingFees.amount}` : "₹0"}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Due by: <span className="font-semibold text-card-foreground">{pendingFees.dueDate}</span>
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-green-600">No pending fees.</p>
            )}
             <Button variant={ (pendingFees.status === 'pending' || pendingFees.status === 'overdue') ? "default" : "link" } 
                    className={cn("px-0 pt-3 h-auto text-sm", (pendingFees.status === 'pending' || pendingFees.status === 'overdue') ? "mt-2" : "text-primary")} 
                    asChild>
              <Link href="/student/fee-notices">
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Next Class</CardTitle>
            {IconForNextClass ? <IconForNextClass className="h-6 w-6 text-primary" /> : <Clock className="h-6 w-6 text-primary" />}
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{nextClass.subject}</p>
            <p className="text-sm text-muted-foreground">
              With {nextClass.teacher}
            </p>
            <p className="text-sm font-medium text-primary mt-1">{nextClassStatus}</p>
            <Button variant="link" className="px-0 pt-3 text-primary h-auto text-sm" asChild>
              <Link href="/student/timetable">Full Timetable <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Links Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:hidden"> {/* For mobile: single column stack */}
            {quickLinks.map((link) => (
                <Card key={link.title} className="border shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] bg-card flex flex-col">
                    <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-md">
                        <link.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-medium text-card-foreground">{link.title}</CardTitle>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                    <CardDescription className="text-sm text-muted-foreground mb-4">{link.description}</CardDescription>
                    <Button variant="outline" className="w-full mt-auto border-primary/50 text-primary hover:bg-primary/5 hover:text-primary" asChild>
                        <Link href={link.href}>
                        Go to {link.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* For larger screens: grid */}
          {quickLinks.map((link) => (
            <Card key={link.title} className="border shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] bg-card flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-medium text-card-foreground">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <CardDescription className="text-sm text-muted-foreground mb-4">{link.description}</CardDescription>
                <Button variant="outline" className="w-full mt-auto border-primary/50 text-primary hover:bg-primary/5 hover:text-primary" asChild>
                  <Link href={link.href}>
                    Go to {link.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity / Notifications Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        <Card className="border shadow-md bg-card">
          <CardContent className="pt-6">
            {notifications.length > 0 ? (
              <ul className="space-y-3">
                {notifications.map((notification) => (
                  <li key={notification.id} className="flex items-center justify-between pb-3 border-b last:border-none">
                    <div className="flex items-center gap-3">
                       {!notification.read && <span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0"></span>}
                       <div className={cn("flex-grow", notification.read ? "ml-5" : "")}> {/* Add margin if read to align text */}
                        <Link href={notification.href} className="font-medium text-foreground hover:underline hover:text-primary transition-colors">
                          {notification.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8 shrink-0" asChild>
                      <Link href={notification.href} aria-label={`View ${notification.title}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No recent activity or notifications.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
