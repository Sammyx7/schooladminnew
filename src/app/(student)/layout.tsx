
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'; // Added useSidebar
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { studentNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils'; // Added cn

function StudentLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const { state: sidebarState } = useSidebar(); // Get sidebar state

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader />
      <div className="flex flex-1 pt-16">
        {userRole === 'student' && (
          <AppSidebar 
            navItems={studentNavItems} 
            role="student" 
            className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
            collapsible="icon" // Make student sidebar collapsible to icon
          />
        )}
        <main 
          className={cn(
            "flex flex-1 flex-col items-stretch bg-background overflow-y-auto transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8",
            sidebarState === 'expanded' ? 'md:ml-[var(--sidebar-width)]' : 'md:ml-[var(--sidebar-width-icon)]'
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
      <SidebarProvider defaultOpen={true}> {/* Wrap with SidebarProvider */}
        <StudentLayoutContent>{children}</StudentLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
