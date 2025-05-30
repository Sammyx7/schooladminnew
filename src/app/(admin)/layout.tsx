
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { adminNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <TopHeader />
          <div className="flex flex-1 pt-16"> {/* pt-16 to offset fixed TopHeader (h-16) */}
            {userRole === 'admin' && (
              <AppSidebar 
                navItems={adminNavItems} 
                role="admin" 
                className="fixed left-0 top-16 bottom-0 z-30 hidden md:block" // Ensure sidebar is fixed and visible
              />
            )}
            {/* Main content area adjustments for fixed sidebar */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background overflow-auto md:ml-[var(--sidebar-width)]"> 
              {/* On mobile, sidebar is off-canvas, so no ml needed initially. On desktop, ml by sidebar width */}
              {/* The sidebar component itself will handle its width via CSS variables */}
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
