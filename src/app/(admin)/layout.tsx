
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { adminNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { AISidebarProvider, useAISidebar } from '@/contexts/AISidebarContext';
import { AISidebar } from '@/components/admin/AISidebar';
import { FloatingAIButton } from '@/components/admin/FloatingAIButton';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();
  const { isAIDocked } = useAISidebar();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <TopHeader />
        <div className="flex flex-1 pt-16">
          {userRole === 'admin' && (
            <AppSidebar 
              navItems={adminNavItems} 
              role="admin" 
              className="fixed left-0 top-16 bottom-0 z-30 hidden md:block"
            />
          )}
          <main 
            className={cn(
              "flex-1 p-4 md:p-6 lg:p-8 bg-background overflow-auto transition-all duration-300 ease-in-out",
              // Removed md:ml-[var(--sidebar-width)] to allow main content to use full width when left sidebar is icon-only
              isAIDocked ? "mr-[var(--ai-sidebar-width)]" : "mr-0" 
            )}
          >
            {children}
          </main>
          {isAIDocked ? <AISidebar /> : <FloatingAIButton />}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AISidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AISidebarProvider>
    </ProtectedRoute>
  );
}
