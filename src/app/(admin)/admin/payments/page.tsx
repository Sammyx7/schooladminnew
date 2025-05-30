
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { History } from 'lucide-react';

export default function AdminPaymentsPage() {
  return (
    <PlaceholderPage
      title="Payment History (Admin View)"
      icon={History}
      description="Track and view payment histories for students."
      featureName="Payment History Tracking"
    />
  );
}
