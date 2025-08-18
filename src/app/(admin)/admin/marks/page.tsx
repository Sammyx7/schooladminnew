
import { ClipboardEdit } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import MarksEntry from '@/components/marks/MarksEntry';

export default function AdminMarksEntryPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Marks Entry"
        icon={ClipboardEdit}
        description="Enter and manage student marks for various subjects and exams."
      />
      <MarksEntry />
    </div>
  );
}
