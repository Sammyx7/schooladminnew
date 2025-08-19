
"use client";

import { PageHeader } from '@/components/layout/PageHeader';
import StaffProfileView from '@/components/staff/StaffProfileView';
import { Briefcase } from 'lucide-react';

export default function StaffProfilePage() {
  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader
        title="My Profile"
        icon={Briefcase}
        description="View your staff information, role, contact details, and qualifications."
        className="mb-3 sm:mb-6"
      />
      <StaffProfileView />
    </div>
  );
}
