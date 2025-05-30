
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ClipboardEdit } from 'lucide-react';

export default function StaffMarksEntryPage() {
  return (
    <PlaceholderPage
      title="Marks Entry"
      icon={ClipboardEdit}
      description="Enter and manage student marks (for authorized staff)."
      featureName="Marks Entry (Staff/Teacher)"
    />
  );
}
