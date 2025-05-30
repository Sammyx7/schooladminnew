
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCommunicationRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/circulars'); // Or any default communication page
  }, [router]);
  return null;
}
