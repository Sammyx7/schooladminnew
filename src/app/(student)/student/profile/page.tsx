
"use client";

// import { useState, useEffect, useMemo } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { 
//   CalendarDays, FileText, Megaphone, Receipt, Clock, AlertTriangle, CheckCircle, 
//   ArrowRight, Loader2, AlertCircle as AlertIcon, Edit3, UserCog, FlaskConical
// } from "lucide-react";
// import Link from "next/link";
// import { getStudentDashboardData } from "@/lib/services/studentService";
// import type { StudentDashboardData, QuickLink } from "@/lib/types";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription as AlertDesc, AlertTitle as AlertMsgTitle } from "@/components/ui/alert";
// import { cn } from "@/lib/utils";
// import { format, differenceInMinutes, isFuture, isPast } from 'date-fns';

// const quickLinks: QuickLink[] = [
//   { title: "My Timetable", href: "/student/timetable", icon: CalendarDays, description: "View your weekly class schedule." },
//   { title: "Fee Notices", href: "/student/fee-notices", icon: Receipt, description: "Check your fee status and dues." },
//   { title: "Report Card", href: "/student/report-card", icon: FileText, description: "Access your academic reports." },
//   { title: "School Circulars", href: "/student/circulars", icon: Megaphone, description: "Read important school announcements." },
// ];

// const getInitials = (name: string) => {
//   if (!name) return "";
//   const names = name.split(" ");
//   let initials = names[0].substring(0, 1).toUpperCase();
//   if (names.length > 1) {
//     initials += names[names.length - 1].substring(0, 1).toUpperCase();
//   }
//   return initials;
// };

// const getNextClassStatus = (timeString: string): string => {
//   if (!timeString) return "Not scheduled";
//   const now = new Date();
//   const [time, period] = timeString.split(' ');
//   let [hours, minutes] = time.split(':').map(Number);

//   if (period?.toUpperCase() === 'PM' && hours < 12) hours += 12;
//   if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0; 

//   const classDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

//   if (isPast(classDateTime) && differenceInMinutes(now, classDateTime) > 60) { 
//     return `Finished (was at ${timeString})`;
//   }
//   if (isPast(classDateTime)) {
//     return `Ongoing (started at ${timeString})`;
//   }
//   if (isFuture(classDateTime)) {
//     const diffMinutes = differenceInMinutes(classDateTime, now);
//     const diffHours = Math.floor(diffMinutes / 60);
//     const remainingMinutes = diffMinutes % 60;
//     if (diffHours > 0) {
//       return `Starts in ${diffHours}h ${remainingMinutes}m`;
//     }
//     return `Starts in ${remainingMinutes}m`;
//   }
//   return `Today at ${timeString}`;
// };

export default function StudentProfilePage() {
  // const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [nextClassStatus, setNextClassStatus] = useState<string>("");

  // useEffect(() => {
  //   async function fetchData() {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const data = await getStudentDashboardData("S10234"); 
  //       setDashboardData(data);
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         setError(err.message);
  //       } else {
  //         setError("An unknown error occurred.");
  //       }
  //       console.error("Failed to fetch dashboard data:", err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   if (dashboardData?.nextClass?.time) {
  //     setNextClassStatus(getNextClassStatus(dashboardData.nextClass.time));
  //     const interval = setInterval(() => {
  //       setNextClassStatus(getNextClassStatus(dashboardData.nextClass.time));
  //     }, 60000); 
  //     return () => clearInterval(interval);
  //   }
  // }, [dashboardData?.nextClass?.time]);


  // const pendingFeesCardBg = useMemo(() => {
  //   if (!dashboardData) return "bg-card";
  //   if (dashboardData.pendingFees.status === 'overdue') return "bg-[hsl(var(--destructive-light-bg))]";
  //   if (dashboardData.pendingFees.status === 'pending') return "bg-[hsl(var(--warning-light-bg))]";
  //   return "bg-card";
  // }, [dashboardData]);

  // const pendingFeesIconColor = useMemo(() => {
  //   if (!dashboardData) return "text-muted-foreground";
  //   if (dashboardData.pendingFees.status === 'overdue') return "text-destructive";
  //   if (dashboardData.pendingFees.status === 'pending') return "text-warning";
  //   return "text-green-500";
  // }, [dashboardData]);


  // if (isLoading) {
  //   return (
  //     <div className="space-y-8">
  //       {/* Skeletons would go here */}
  //       <p>Loading dashboard...</p>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[60vh]">
  //       <Alert variant="destructive" className="max-w-lg">
  //         <AlertIcon className="h-5 w-5" />
  //         <AlertMsgTitle>Error Fetching Data</AlertMsgTitle>
  //         <AlertDesc>{error}</AlertDesc>
  //       </Alert>
  //       <Button onClick={() => window.location.reload()} className="mt-6">
  //         Try Again
  //       </Button>
  //     </div>
  //   );
  // }

  // if (!dashboardData) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[60vh]">
  //       <p className="text-muted-foreground">No dashboard data available.</p>
  //     </div>
  //   );
  // }

  // const { profile, pendingFees, nextClass, notifications } = dashboardData;
  // const IconForNextClass = nextClass.subjectIcon || FlaskConical; // Default icon

  return (
    <div className="p-4 border-4 border-red-500 h-[300px] bg-blue-100">
      <h1 className="text-3xl font-bold mb-4 text-red-700">STUDENT PROFILE PAGE - SIMPLIFIED</h1>
      <p className="text-lg text-red-600">This is a temporary, simplified version of the student profile page to test the main layout.</p>
      <p className="text-lg text-red-600">If this page renders correctly (no shift to the right, content is centered within the main area next to the sidebar), then the layout issue is within the original complex content of this page.</p>
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-500">
        <p className="font-bold">Test Content Area</p>
        <p>More lines to ensure it takes some space.</p>
        <p>The red border around this entire blue box shows the boundary of this simplified page content.</p>
      </div>
    </div>
  );
}
