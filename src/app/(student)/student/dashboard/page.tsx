
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { BarChart, CheckCircle, Clock, ArrowRight, Hand, CalendarDays, Receipt, GraduationCap, History, Megaphone, AlertCircle as AlertIcon } from 'lucide-react';
import type { StudentDashboardData, Circular } from '@/lib/types';
import { getStudentDashboardData } from '@/lib/services/studentService';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const quickLinks = [
    { title: "My Timetable", href: "/student/timetable", icon: CalendarDays },
    { title: "Fee Notices", href: "/student/fees", icon: Receipt },
    { title: "Report Card", href: "/student/report-card", icon: GraduationCap },
    { title: "Payment History", href: "/student/payments", icon: History },
];


export default async function StudentDashboardPage() {
    let dashboardData: StudentDashboardData | null = null;
    let error: string | null = null;

    const MOCK_STUDENT_ID = "S10234";

    try {
        dashboardData = await getStudentDashboardData(MOCK_STUDENT_ID);
    } catch (err) {
        error = err instanceof Error ? err.message : "An unknown error occurred.";
    }


    if (error || !dashboardData) {
        return (
            <Alert variant="destructive">
                <AlertIcon className="h-5 w-5" />
                <AlertMsgTitle>Failed to Load Dashboard</AlertMsgTitle>
                <AlertDescription>{error || "Could not fetch student dashboard data."}</AlertDescription>
            </Alert>
        );
    }
    
    const { profile, attendancePercentage, feesDue, recentCirculars } = dashboardData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="student avatar"/>
                        <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            Welcome, {profile.name.split(' ')[0]}! <Hand className="h-6 w-6 text-yellow-400" />
                        </h1>
                        <p className="text-muted-foreground">{profile.classSection} | ID: {profile.studentId}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Attendance"
                    value={`${attendancePercentage}%`}
                    icon={CheckCircle}
                    description="Overall attendance record"
                    bgColorClass="bg-[hsl(var(--metric-card-green-bg))]"
                    iconBgClass="bg-[hsl(var(--metric-card-green-icon-bg))]"
                    iconColorClass="text-[hsl(var(--metric-card-green-icon))]"
                />
                <MetricCard
                    title="Pending Fees"
                    value={`₹${feesDue.toLocaleString('en-IN')}`}
                    icon={Clock}
                    description="Total outstanding fees"
                    bgColorClass={feesDue > 0 ? "bg-[hsl(var(--metric-card-red-bg))]" : "bg-[hsl(var(--metric-card-blue-bg))]"}
                    iconBgClass={feesDue > 0 ? "bg-[hsl(var(--metric-card-red-icon-bg))]" : "bg-[hsl(var(--metric-card-blue-icon-bg))]"}
                    iconColorClass={feesDue > 0 ? "text-[hsl(var(--metric-card-red-icon))]" : "text-[hsl(var(--metric-card-blue-icon))]"}
                />
                <MetricCard
                    title="Academic Performance"
                    value="View"
                    icon={BarChart}
                    description="Check your latest report card"
                    bgColorClass="bg-[hsl(var(--metric-card-purple-bg))]"
                    iconBgClass="bg-[hsl(var(--metric-card-purple-icon-bg))]"
                    iconColorClass="text-[hsl(var(--metric-card-purple-icon))]"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-2 shadow-md border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-card-foreground">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        {quickLinks.map((link) => (
                            <Link href={link.href} key={link.title} passHref>
                                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-1 text-xs sm:flex-row sm:justify-start sm:text-sm">
                                    <link.icon className="h-5 w-5 mb-1 sm:mb-0 sm:mr-2 text-primary" />
                                    <span>{link.title}</span>
                                </Button>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                 <Card className="md:col-span-3 shadow-md border bg-card">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-semibold text-card-foreground">Recent Circulars</CardTitle>
                            <CardDescription>Latest announcements from the school.</CardDescription>
                        </div>
                         <Button variant="ghost" size="sm" asChild>
                            <Link href="/student/circulars">View All <ArrowRight className="ml-1.5 h-4 w-4"/></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ul className="space-y-0">
                            {recentCirculars.length > 0 ? recentCirculars.map((circ) => (
                                <li key={circ.id} className="flex items-center justify-between py-3 border-b last:border-none">
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{circ.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(parseISO(circ.date), "do MMMM, yyyy")}</p>
                                    </div>
                                    {circ.category && <Badge variant="outline" className="text-xs hidden sm:inline-flex">{circ.category}</Badge>}
                                </li>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent circulars.</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
