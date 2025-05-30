
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="Admin Settings"
      icon={Settings}
      description="Configure system settings, notification preferences, etc."
      featureName="Admin Settings Panel"
    />
  );
}
