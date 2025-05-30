
"use client";
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertTriangle, Users, ArrowRight, LayoutDashboard, Eye } from 'lucide-react';
import { List, ListItem } from '@/components/ui/list'; // Assuming you'll create a List component

// Mock data - replace with actual data fetching
const feesCollected = "₹1,250,000";
const pendingPayments = "₹180,000";
const overduePayments = "₹45,000";
const totalStudents = "450";

const recentPaymentsData = [
  { name: "Arjun Sharma", time: "2 hours ago", amount: "₹15,000", amountColor: "text-green-600" },
  { name: "Priya Patel", time: "4 hours ago", amount: "₹12,000", amountColor: "text-green-600" },
  { name: "Rahul Kumar", time: "6 hours ago", amount: "₹8,000", amountColor: "text-green-600" },
];

const pendingNoticesData = [
  { name: "Meera Singh", due: "Due in 3 days", amount: "₹18,000", amountColor: "text-orange-600" },
  { name: "Vikram Joshi", due: "Due in 5 days", amount: "₹22,000", amountColor: "text-orange-600" },
  { name: "Ananya Reddy", due: "Due in 1 week", amount: "₹15,000", amountColor: "text-orange-600" },
];


export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Admin Dashboard" 
          icon={LayoutDashboard} 
          description="Overview of school fees management" 
        />
        <Button variant="outline" className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-blue-100 border-blue-300">
          <Eye className="mr-2 h-4 w-4" />
          Switch to Parent View (Demo)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Fees Collected"
          value={feesCollected}
          icon={DollarSign}
          description="This month"
          bgColorClass="bg-[hsl(var(--metric-card-green-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-green-icon))]"
          valueColorClass="text-[hsl(var(--metric-card-green-value))]"
        />
        <MetricCard
          title="Pending Payments"
          value={pendingPayments}
          icon={TrendingUp} // Or Clock icon
          description="This month"
          bgColorClass="bg-[hsl(var(--metric-card-blue-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-blue-icon))]"
          valueColorClass="text-[hsl(var(--metric-card-blue-value))]"
        />
        <MetricCard
          title="Overdue Payments"
          value={overduePayments}
          icon={AlertTriangle}
          description="This month"
          bgColorClass="bg-[hsl(var(--metric-card-red-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-red-icon))]"
          valueColorClass="text-[hsl(var(--metric-card-red-value))]"
        />
        <MetricCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          description="Enrolled students"
          bgColorClass="bg-[hsl(var(--metric-card-purple-bg))]"
          iconColorClass="text-[hsl(var(--metric-card-purple-icon))]"
          valueColorClass="text-[hsl(var(--metric-card-purple-value))]"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {recentPaymentsData.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b last:border-none">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <p className={`font-semibold text-sm ${item.amountColor}`}>{item.amount}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg">Pending Fee Notices</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {pendingNoticesData.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b last:border-none">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.due}</p>
                  </div>
                  <p className={`font-semibold text-sm ${item.amountColor}`}>{item.amount}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
