
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarDays } from 'lucide-react';

export default function AdminStudentAttendancePage() {
  return (
    <PlaceholderPage
      title="Student Attendance"
      icon={CalendarDays}
      description="Track and manage student attendance records."
      featureName="Student Attendance Management"
    />
  );
}
