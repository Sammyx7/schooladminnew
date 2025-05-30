
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFinanceRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/fees/bulk-notice'); // Or any default finance page
  }, [router]);
  return null;
}
