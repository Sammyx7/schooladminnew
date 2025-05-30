
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DollarSign, Users, UserCheck, CalendarCheck, LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock data
  const feesCollected = "$150,000";
  const pendingAdmissions = "25";
  const totalStudents = "500";
  const staffAttendance = "95%";

  return (
    <div>
      <PageHeader title="Admin Dashboard" icon={LayoutDashboard} description="Overview of school operations." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Fees Collected"
          value={feesCollected}
          icon={DollarSign}
          description="This academic year"
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <MetricCard
          title="Pending Admissions"
          value={pendingAdmissions}
          icon={UserCheck}
          description="Awaiting review"
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <MetricCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          description="Currently enrolled"
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <MetricCard
          title="Staff Attendance"
          value={staffAttendance}
          icon={CalendarCheck}
          description="Average for this month"
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
      </div>
      {/* Additional dashboard components can be added here */}
    </div>
  );
}
