
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminStaffManagementRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/staff'); // Redirect to the "View Staff" page
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Redirecting to staff list...</p>
    </div>
  );
}
