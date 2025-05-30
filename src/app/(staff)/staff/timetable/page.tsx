
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarDays } from 'lucide-react'; // Changed from CalendarGrid

export default function StaffTimetablePage() {
  return (
    <PlaceholderPage
      title="My Timetable"
      icon={CalendarDays} // Changed from CalendarGrid
      description="View and manage your teaching schedule (for authorized staff)."
      featureName="Timetable Management (Staff/Class Teacher)"
    />
  );
}
