
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { CalendarDays } from 'lucide-react'; // Changed from CalendarGrid

export default function AdminTimetablePage() {
  return (
    <PlaceholderPage
      title="Timetable Management"
      icon={CalendarDays} // Changed from CalendarGrid
      description="View and manage school timetables for different classes and sections."
      featureName="Timetable Management"
    />
  );
}
