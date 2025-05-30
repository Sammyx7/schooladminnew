
"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to a generic unauthorized page or their respective dashboard
        router.replace(`/${userRole}/dashboard` || '/login'); 
      }
    }
  }, [isLoading, isAuthenticated, userRole, allowedRoles, router]);

  if (isLoading || !isAuthenticated || (userRole && !allowedRoles.includes(userRole))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
