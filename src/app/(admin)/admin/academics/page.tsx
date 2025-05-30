
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAcademicsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/marks'); // Or any default academics page
  }, [router]);
  return null; 
}
