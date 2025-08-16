
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const USER_DETAILS = {
  admin: { name: 'Dr. Priya Nair', email: 'dr.priya.nair@example.com' },
  staff: { name: 'Mr. Vikram Singh', email: 'vikram.singh@example.com' },
  student: { name: 'Aisha Sharma', email: 'aisha.sharma@example.com' },
};

// Helper function to get a default dashboard path
const getDefaultDashboardPath = (role: string | null) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'staff': return '/staff/profile';
    case 'student': return '/student/dashboard';
    default: return '/login';
  }
};

export function TopHeader() {
  const { userRole, logout } = useAuth();
  const router = useRouter();

  const userDetails = userRole ? USER_DETAILS[userRole] : { name: 'Guest', email: ''};
  const userName = userDetails.name;
  const userEmail = userDetails.email;

  const handleProfileClick = () => {
    // Navigate to profile for staff, dashboard otherwise
    const path = userRole === 'staff' ? '/staff/profile' : getDefaultDashboardPath(userRole);
    router.push(path);
  }

  return (
    <header className="bg-card text-card-foreground h-16 flex items-center justify-between px-4 md:px-6 border-b fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-3">
        <Link href={getDefaultDashboardPath(userRole)} className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-md w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-sm">LOGO</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Elite Minds International</h1>
            <p className="text-xs text-muted-foreground">School Management System</p>
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
            <DropdownMenuItem onClick={handleProfileClick}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>{userRole === 'staff' ? 'Profile' : 'Dashboard'}</span>
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
