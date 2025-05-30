
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { staffNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function StaffLayout({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <SidebarProvider>
        <div className="flex min-h-screen">
          {userRole === 'staff' && <AppSidebar navItems={staffNavItems} role="staff" />}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background overflow-auto">
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
