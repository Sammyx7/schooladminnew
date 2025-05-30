
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && userRole) {
        switch (userRole) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'student':
            router.replace('/student/profile');
            break;
          case 'staff':
            router.replace('/staff/profile');
            break;
          default:
            router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, userRole, router, isLoading]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
