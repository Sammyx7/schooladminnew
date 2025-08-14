
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'; // Added useSidebar
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { staffNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader'; // Assuming TopHeader should be here
import { cn } from '@/lib/utils'; // Added cn

function StaffLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const { state: sidebarState } = useSidebar(); // Get sidebar state

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader /> {/* Added TopHeader for consistency */}
      <div className="flex flex-1 pt-16"> {/* Added pt-16 for TopHeader */}
        {userRole === 'staff' && (
          <AppSidebar 
            navItems={staffNavItems} 
            role="staff" 
            className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
            collapsible="icon" // Make staff sidebar collapsible to icon
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

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <SidebarProvider defaultOpen={true}> {/* Wrap with SidebarProvider */}
        <StaffLayoutContent>{children}</StaffLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
