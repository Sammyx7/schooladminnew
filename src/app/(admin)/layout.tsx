
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { adminNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { AISidebarProvider, useAISidebar } from '@/contexts/AISidebarContext';
import { AISidebar } from '@/components/admin/AISidebar';
import { FloatingAIButton } from '@/components/admin/FloatingAIButton';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const { isAIDocked } = useAISidebar();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader />
      <div className="flex flex-1 pt-16 min-w-0">
        {userRole === 'admin' && (
          <AppSidebar 
            navItems={adminNavItems} 
            role="admin" 
            className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
          />
        )}
        <main 
          className={cn(
            "flex flex-1 flex-col items-stretch bg-background overflow-y-auto overflow-x-hidden min-w-0 box-border pl-4 sm:pl-6 lg:pl-8 pr-0 pb-4 pt-[5px]"
          )}
          style={{
            width: '100%',
          }}
        >
          {children}
        </main>
        {isAIDocked ? <AISidebar /> : <FloatingAIButton />}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SidebarProvider defaultOpen={true}>
        <AISidebarProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AISidebarProvider>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
