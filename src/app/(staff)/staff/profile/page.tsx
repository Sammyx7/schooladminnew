
"use client";

import { PageHeader } from '@/components/layout/PageHeader';
import StaffProfileView from '@/components/staff/StaffProfileView';

export default function StaffProfilePage() {
  return (
    <div className="w-full min-w-0 space-y-3 sm:space-y-6">
      <PageHeader
        title="My Profile"
        description="View your staff information, role, contact details, and qualifications."
        className="mb-3 sm:mb-6"
      />
      <StaffProfileView />
    </div>
  );
}
