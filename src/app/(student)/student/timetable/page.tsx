
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarGrid } from 'lucide-react';

export default function StudentTimetablePage() {
  return (
    <PlaceholderPage
      title="My Timetable"
      icon={CalendarGrid}
      description="View your weekly class schedule."
      featureName="Student Timetable Viewer"
    />
  );
}
