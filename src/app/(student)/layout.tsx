
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { studentNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';

function StudentLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader />
      <div className="flex flex-1 pt-16 min-w-0">
        {userRole === 'student' && (
          <AppSidebar 
            navItems={studentNavItems} 
            role="student" 
            className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
          />
        )}
        <main 
          className={cn(
            "flex flex-1 flex-col items-stretch bg-background overflow-y-auto overflow-x-hidden min-w-0 box-border px-4 sm:px-6 lg:px-8 pb-4 pt-[5px]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <SidebarProvider defaultOpen={true}>
        <StudentLayoutContent>{children}</StudentLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
