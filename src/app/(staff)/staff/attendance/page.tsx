
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { QrCode } from 'lucide-react';

export default function StaffAttendancePage() {
  return (
    <PlaceholderPage
      title="My Attendance"
      icon={QrCode}
      description="Record your attendance by scanning a QR code and view your attendance history."
      featureName="Staff Attendance (QR Scan & History)"
    />
  );
}
