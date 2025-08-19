
"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  unauthRedirect?: string; // where to send unauthenticated users
  unauthorizedRedirect?: string; // where to send authenticated users lacking permission
}

export default function ProtectedRoute({ children, allowedRoles, unauthRedirect, unauthorizedRedirect }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Send unauthenticated users to provided redirect or default admin login
        router.replace(unauthRedirect ?? '/adminlogin');
      } else if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to a generic unauthorized page or their respective dashboard
        if (unauthorizedRedirect) {
          router.replace(unauthorizedRedirect);
        } else {
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
              router.replace('/staff/profile');
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, userRole, allowedRoles, router, unauthRedirect, unauthorizedRedirect]);

  if (isLoading || !isAuthenticated || (userRole && !allowedRoles.includes(userRole))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
