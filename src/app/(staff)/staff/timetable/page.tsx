
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarGrid } from 'lucide-react';

export default function StaffTimetablePage() {
  return (
    <PlaceholderPage
      title="My Timetable"
      icon={CalendarGrid}
      description="View and manage your teaching schedule (for authorized staff)."
      featureName="Timetable Management (Staff/Class Teacher)"
    />
  );
}
