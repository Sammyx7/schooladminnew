
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, FileText, Megaphone, Receipt, Clock, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock Data
const studentData = {
  name: "Aisha Sharma",
  avatarUrl: "https://placehold.co/100x100.png",
  studentId: "S10234",
  classSection: "Class 10 - Section A",
  pendingFees: {
    amount: "2,500",
    dueDate: "15th July 2024",
    status: "pending" as "pending" | "none",
  },
  nextClass: {
    subject: "Mathematics",
    time: "10:00 AM",
    teacher: "Mr. Srinivasan",
  },
  notifications: [
    { id: 1, type: "circular", title: "Annual Sports Day announced", date: "2 days ago", href: "/student/circulars" },
    { id: 2, type: "fee", title: "Term 2 fee payment reminder", date: "Yesterday", href: "/student/fee-notices" },
    { id: 3, type: "report", title: "Mid-term report card available", date: "3 days ago", href: "/student/report-card" },
  ],
};

const quickLinks = [
  { title: "My Timetable", href: "/student/timetable", icon: CalendarDays, description: "View your weekly class schedule." },
  { title: "Fee Notices", href: "/student/fee-notices", icon: Receipt, description: "Check your fee status and dues." },
  { title: "Report Card", href: "/student/report-card", icon: FileText, description: "Access your academic reports." },
  { title: "School Circulars", href: "/student/circulars", icon: Megaphone, description: "Read important school announcements." },
];

export default function StudentProfilePage() {
  return (
    <div className="space-y-8"> {/* Increased spacing */}
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={studentData.avatarUrl} alt={studentData.name} data-ai-hint="student avatar" />
            <AvatarFallback>{studentData.name.substring(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {studentData.name}!</h1>
            <p className="text-md text-muted-foreground">
              {studentData.studentId} &bull; {studentData.classSection}
            </p>
          </div>
        </div>
        {/* Optional: A quick action button if needed e.g., Edit Profile */}
      </section>

      {/* Key Info Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Pending Fees</CardTitle>
            {studentData.pendingFees.status === 'pending' ? 
              <AlertTriangle className="h-6 w-6 text-destructive" /> : 
              <CheckCircle className="h-6 w-6 text-green-500" />
            }
          </CardHeader>
          <CardContent>
            {studentData.pendingFees.status === 'pending' ? (
              <>
                <p className="text-3xl font-bold text-destructive">₹{studentData.pendingFees.amount}</p>
                <p className="text-sm text-muted-foreground">Due by {studentData.pendingFees.dueDate}</p>
              </>
            ) : (
              <p className="text-xl text-green-600">No pending fees.</p>
            )}
            <Button variant="link" className="px-0 pt-3 text-primary h-auto text-sm" asChild>
              <Link href="/student/fee-notices">View Details <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Next Class</CardTitle>
            <Clock className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{studentData.nextClass.subject}</p>
            <p className="text-sm text-muted-foreground">
              At {studentData.nextClass.time} with {studentData.nextClass.teacher}
            </p>
            <Button variant="link" className="px-0 pt-3 text-primary h-auto text-sm" asChild>
              <Link href="/student/timetable">Full Timetable <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Links Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Card key={link.title} className="border shadow-md hover:shadow-lg transition-shadow bg-card flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-card-foreground">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <CardDescription className="text-sm mb-4 text-muted-foreground">{link.description}</CardDescription>
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
            {studentData.notifications.length > 0 ? (
              <ul className="space-y-3">
                {studentData.notifications.map((notification) => (
                  <li key={notification.id} className="flex items-center justify-between pb-3 border-b last:border-none">
                    <div>
                      <Link href={notification.href} className="font-medium text-foreground hover:underline hover:text-primary transition-colors">
                        {notification.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" asChild>
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
