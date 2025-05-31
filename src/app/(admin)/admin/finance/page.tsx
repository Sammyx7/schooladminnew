
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer directly linked in the sidebar.
// Kept for potential direct access or future restructuring.
// It redirects to the bulk fee notice page as a default finance view.
export default function AdminFinanceRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/fees/bulk-notice'); 
  }, [router]);
  return null;
}
