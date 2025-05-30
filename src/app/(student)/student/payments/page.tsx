
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { History } from 'lucide-react';

export default function StudentPaymentsPage() {
  return (
    <PlaceholderPage
      title="My Payment History"
      icon={History}
      description="Track your past payments and fee status."
      featureName="Student Payment History"
    />
  );
}
