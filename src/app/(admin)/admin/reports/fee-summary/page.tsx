
"use client";

import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import type { FeeReportData } from '@/lib/types';
import { MOCK_FEE_REPORT_DATA } from '@/lib/services/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// This would come from a service, but for the demo we use mock data.
const reportData: FeeReportData[] = MOCK_FEE_REPORT_DATA;

export default function FeeSummaryReportPage() {
    
  const summaryStats = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    
    reportData.forEach(item => {
      totalCollected += item.paid;
      totalPending += item.pending;
      totalOverdue += item.overdue;
    });

    return { totalCollected, totalPending, totalOverdue };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Collection Summary Report"
        icon={DollarSign}
        description="Track fees collected, pending payments, and overdue amounts across classes."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Fees Collected"
          value={`₹${summaryStats.totalCollected.toLocaleString('en-IN')}`}
          icon={CheckCircle}
          description="Across all classes this term"
          bgColorClass="bg-[hsl(var(--metric-card-green-bg))]"
          iconBgClass="bg-[hsl(var(--metric-card-green-icon-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-green-icon))]"
        />
        <MetricCard
          title="Total Pending"
          value={`₹${summaryStats.totalPending.toLocaleString('en-IN')}`}
          icon={Clock}
          description="Upcoming payments"
          bgColorClass="bg-[hsl(var(--metric-card-blue-bg))]"
          iconBgClass="bg-[hsl(var(--metric-card-blue-icon-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-blue-icon))]"
        />
        <MetricCard
          title="Total Overdue"
          value={`₹${summaryStats.totalOverdue.toLocaleString('en-IN')}`}
          icon={AlertTriangle}
          description="Payments past due date"
          bgColorClass="bg-[hsl(var(--metric-card-red-bg))]"
          iconBgClass="bg-[hsl(var(--metric-card-red-icon-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-red-icon))]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-md">
            <CardHeader>
                <CardTitle>Fee Status by Class</CardTitle>
                <CardDescription>Visualization of paid, pending, and overdue fees.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                       stroke="hsl(var(--muted-foreground))"
                       fontSize={12}
                       tickLine={false}
                       axisLine={false}
                       tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--accent))' }}
                      formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                       contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="paid" stackId="a" fill="hsl(var(--chart-2))" name="Paid" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-1))" name="Pending" />
                    <Bar dataKey="overdue" stackId="a" fill="hsl(var(--chart-3))" name="Overdue" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="border shadow-md">
            <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>Fee collection details for each class.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground text-green-600">Paid (₹)</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground text-blue-600">Pending (₹)</TableHead>
                    <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground text-red-600">Overdue (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.map((item) => (
                    <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right font-medium">{item.paid.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-medium">{item.pending.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-medium">{item.overdue.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
