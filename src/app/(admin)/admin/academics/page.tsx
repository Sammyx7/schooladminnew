
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer directly linked in the sidebar.
// Kept for potential direct access or future restructuring.
// It redirects to the marks entry page.
export default function AdminAcademicsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/marks'); 
  }, [router]);
  return null; 
}
