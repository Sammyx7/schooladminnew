
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { UserCircle } from 'lucide-react';

export default function StudentProfilePage() {
  return (
    <PlaceholderPage
      title="My Profile"
      icon={UserCircle}
      description="View your personal details, contact information, and documents."
      featureName="Student Profile Display"
    />
  );
}
