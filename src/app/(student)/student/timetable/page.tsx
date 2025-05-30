
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarDays } from 'lucide-react'; // Changed from CalendarGrid

export default function StudentTimetablePage() {
  return (
    <PlaceholderPage
      title="My Timetable"
      icon={CalendarDays} // Changed from CalendarGrid
      description="View your weekly class schedule."
      featureName="Student Timetable Viewer"
    />
  );
}
