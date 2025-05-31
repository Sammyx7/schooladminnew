
"use client";

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, DollarSign, CalendarCheck, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { ReportListItem } from '@/lib/types';


const reportItems: ReportListItem[] = [
  {
    title: 'Student Performance Reports',
    description: 'Generate and view individual or class-wise student report cards.',
    icon: FileText,
    href: '/admin/reports/report-cards',
    actionText: 'View Reports',
    isImplemented: true,
  },
  {
    title: 'Fee Collection Summary',
    description: 'Track total fees collected, pending payments, and overdue amounts.',
    icon: DollarSign,
    href: '#',
    actionText: 'Generate Summary',
    isImplemented: false,
  },
  {
    title: 'Attendance Analysis',
    description: 'Analyze student attendance trends, identify absentees, and generate reports.',
    icon: CalendarCheck,
    href: '#',
    actionText: 'Analyze Attendance',
    isImplemented: false,
  },
  {
    title: 'Student Demographics Report',
    description: 'View statistics on student enrollment, class distribution, etc.',
    icon: Users,
    href: '#',
    actionText: 'View Demographics',
    isImplemented: false,
  },
];


export default function AdminReportsOverviewPage() {
  const { toast } = useToast();

  const handleActionClick = (report: ReportListItem) => {
    if (!report.isImplemented) {
      toast({
        title: "Feature Coming Soon",
        description: `The "${report.title}" feature is currently under development.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Overview"
        icon={BarChart3}
        description="Access various reports and analytics for school administration."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportItems.map((report) => (
          <Card key={report.title} className="border shadow-md flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <report.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto"> {/* Pushes button to the bottom */}
              {report.isImplemented ? (
                <Link href={report.href!} passHref>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {report.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleActionClick(report)}
                >
                  {report.actionText}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


    