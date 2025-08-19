
"use client";

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { studentNavItems } from '@/lib/navData';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils'; // Added cn
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink } from 'lucide-react';

function StudentLayoutContent({ children }: { children: ReactNode }) {
  const { userRole } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopHeader />
      <div className="flex flex-1 pt-16 min-w-0">
        {/* Student sidebar is intentionally hidden as portal moved to mobile */}
        <main
          className={cn(
            "flex flex-1 flex-col items-stretch bg-background overflow-y-auto overflow-x-hidden p-4 min-w-0"
          )}
        >
          {userRole === 'student' ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Card className="max-w-xl w-full border shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" /> Student Portal has moved to Mobile
                  </CardTitle>
                  <CardDescription>
                    The web student dashboard has been discontinued. Please use our mobile app.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="w-full" asChild>
                      <Link href="/student-moved">Learn more & store links <ExternalLink className="h-4 w-4 ml-2" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            children
          )}
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
