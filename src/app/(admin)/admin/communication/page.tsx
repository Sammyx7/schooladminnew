
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer directly linked in the sidebar.
// Kept for potential direct access or future restructuring.
// It redirects to the circulars page.
export default function AdminCommunicationRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulars'); 
  }, [router]);
  return null;
}
