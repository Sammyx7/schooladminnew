
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { staffNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaffMobileTabBar } from '@/components/layout/StaffMobileTabBar';

function StaffLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();
  

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <TopHeader />
      <div className="flex flex-1 pt-16 min-w-0 overflow-x-hidden">
        {userRole === 'staff' && (
          <AppSidebar 
            navItems={staffNavItems} 
            role="staff" 
            className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
          />
        )}
        <main 
          className={cn(
            "flex flex-1 flex-col items-stretch bg-background overflow-y-auto overflow-x-hidden min-w-0 box-border px-4 sm:px-6 lg:px-8 pb-16 md:pb-4 pt-[5px]"
          )}
          style={{
            width: isMobile
              ? '100%'
              : `calc(100vw - ${sidebarState === 'collapsed' ? 'var(--sidebar-width-icon)' : 'var(--sidebar-width)'})`,
            paddingBottom: isMobile ? 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' : undefined
          }}
        >
          {children}
        </main>
      </div>
      <StaffMobileTabBar />
    </div>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['staff']} unauthRedirect="/stafflogin">
      <SidebarProvider defaultOpen={true}>
        <StaffLayoutContent>{children}</StaffLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
