
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added import
import { Bell, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopHeader() {
  const { userRole, logout } = useAuth();
  const router = useRouter(); // Initialized router
  // Mock user data - in a real app, this would come from auth context or API
  const userName = "Dr. Priya Nair"; 
  const userEmail = "dr.priya.nair@example.com";

  return (
    <header className="bg-card text-card-foreground h-16 flex items-center justify-between px-4 md:px-6 border-b fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-3">
        <Link href={`/${userRole === 'admin' ? 'admin/dashboard' : userRole === 'student' ? 'student/profile' : 'staff/profile' }`} className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-md w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-sm">LOGO</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Greenwood International School</h1>
            <p className="text-xs text-muted-foreground">Fee Management System</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt={userName} data-ai-hint="user avatar" />
                <AvatarFallback>{userName.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
              </div>
              {userRole && (
                <Badge 
                  variant="outline" 
                  className="capitalize text-xs px-2 py-0.5 border-primary/30 bg-primary text-primary-foreground rounded-full hidden md:inline-flex"
                >
                  {userRole}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize md:hidden">
                  Role: {userRole}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(getDefaultDashboardPath(userRole))}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Helper function to get a default dashboard path - you might want to move this or improve it
const getDefaultDashboardPath = (role: string | null) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'student': return '/student/profile';
    case 'staff': return '/staff/profile';
    default: return '/login';
  }
};

