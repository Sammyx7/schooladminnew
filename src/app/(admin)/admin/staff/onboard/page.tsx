
"use client";

import { PageHeader } from '@/components/layout/PageHeader';
import StaffOnboardingForm from '@/components/staff/StaffOnboardingForm';
import { UserPlus } from 'lucide-react';

export default function AdminTeacherOnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Onboarding"
        icon={UserPlus}
        description="Onboard new teachers, collect information, and manage qualifications."
      />
      <StaffOnboardingForm />
    </div>
  );
}
