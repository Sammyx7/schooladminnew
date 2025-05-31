
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LogOut, Settings } from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  navItems: NavItem[];
  role: string;
  className?: string;
}

export function AppSidebar({ navItems, role, className }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      // More robust active check: exact match for dashboard/profile, startsWith for others
      const isActive = item.href === pathname || 
                       (item.href !== `/${role}/dashboard` && 
                        item.href !== `/${role}/profile` && 
                        pathname.startsWith(item.href) && 
                        item.href !== '/'); // Avoid root path always being active for sub-paths

      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={{ 
              content: item.title, 
              side: 'right', 
              align: 'center', 
              className: "bg-primary text-primary-foreground border-none shadow-md" 
            }}
            className={cn(
              "pl-3 pr-2 py-2.5 h-auto text-sm justify-start relative group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:h-8", // Adjusted padding/height for icon state
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-4 border-primary -ml-1 pl-[calc(0.75rem-4px)] group-data-[collapsible=icon]:pl-2 group-data-[collapsible=icon]:-ml-0" // Adjusted padding for border
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Link href={item.href} className="flex items-center gap-3 w-full">
              <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground')} />
              <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-opacity duration-200">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar 
      collapsible="icon" 
      side="left" 
      variant="sidebar"
      className={cn(
        "border-r border-sidebar-border bg-sidebar-background",
        "w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
        className 
      )}
    >
      <SidebarContent className="p-2 mt-2 flex-grow">
        <SidebarMenu>
          {renderNavItems(navItems)}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip={{ content: "Settings", side: 'right', align: 'center', className: "bg-primary text-primary-foreground border-none shadow-md" }} 
              className={cn(
                "pl-3 pr-2 py-2.5 h-auto text-sm justify-start relative group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:h-8",
                pathname === `/${role}/settings`
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-4 border-primary -ml-1 pl-[calc(0.75rem-4px)] group-data-[collapsible=icon]:pl-2 group-data-[collapsible=icon]:-ml-0"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              isActive={pathname === `/${role}/settings`}
            >
              <Link href={`/${role}/settings`} className="flex items-center gap-3 w-full">
                <Settings className={cn('h-5 w-5 shrink-0', pathname === `/${role}/settings` ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground')} />
                <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-opacity duration-200">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              tooltip={{ content: "Logout", side: 'right', align: 'center', className: "bg-primary text-primary-foreground border-none shadow-md" }} 
              className="pl-3 pr-2 py-2.5 h-auto text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground justify-start group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:h-8"
            >
              <div className="flex items-center gap-3 w-full">
                <LogOut className="h-5 w-5 shrink-0 text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground" />
                <span className="truncate group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-opacity duration-200">Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
