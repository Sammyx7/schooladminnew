
import { PageHeader } from '@/components/layout/PageHeader';
import MarksEntry from '@/components/marks/MarksEntry';

export default function StaffMarksEntryPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Marks Entry (Staff/Teacher)"
        description="Authorized staff can enter and manage student marks for assessments and examinations."
      />
      <MarksEntry />
    </div>
  );
}
