
"use client";

import Link from 'next/link';
import Image from 'next/image';
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
  // Mock user data - in a real app, this would come from auth context or API
  const userName = "Dr. Priya Nair"; 
  const userEmail = "dr.priya.nair@example.com";

  return (
    <header className="bg-card text-card-foreground h-16 flex items-center justify-between px-4 md:px-6 border-b fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-3">
        <Link href={`/${userRole}/dashboard`} className="flex items-center gap-2">
          {/* Placeholder Logo */}
          <div className="bg-primary text-primary-foreground p-2 rounded-md w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-sm">LOGO</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Greenwood International School</h1>
            <p className="text-xs text-muted-foreground">Fee Management System</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt={userName} data-ai-hint="user avatar" />
                <AvatarFallback>{userName.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                {userRole && <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5 border-primary/50 text-primary">{userRole}</Badge>}
              </div>
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
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Profile page placeholder')}>
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
