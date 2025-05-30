
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { QrCode } from 'lucide-react';

export default function AdminStaffAttendancePage() {
  return (
    <PlaceholderPage
      title="Staff Attendance"
      icon={QrCode}
      description="Generate QR codes and track staff attendance."
      featureName="Staff Attendance Management (QR, History)"
    />
  );
}
