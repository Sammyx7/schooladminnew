
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { School, LogOut, Settings } from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface AppSidebarProps {
  navItems: NavItem[];
  role: string;
}

export function AppSidebar({ navItems, role }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href) && item.href !== `/${role}` && item.href.length > `/${role}`.length +1 )} // More specific active check
          tooltip={{ content: item.title, side: 'right', align: 'center', className: "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border" }}
          className={isSubmenu ? "pl-10" : "pl-2"} // Adjusted padding
        >
          <Link href={item.href}>
            <item.icon className="h-5 w-5" /> {/* Ensured consistent icon size */}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.children && item.children.length > 0 && (
          <SidebarMenu className="pl-6"> {/* Indent sub-menu items visually, slightly less */}
            {renderNavItems(item.children, true)}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    ));
  };


  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r border-sidebar-border">
      <SidebarHeader>
        <Link href={`/${role}/dashboard`} className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-sidebar-accent/80">
          <School className="h-9 w-9 text-sidebar-primary" /> {/* Slightly larger logo icon */}
          <span className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            SchoolAdmin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2"> {/* Added padding to content area */}
        <SidebarMenu>
          {navItems.map((group, index) => (
            <SidebarGroup key={index} className="p-0"> {/* Removed default padding from group */}
              {group.title && <SidebarGroupLabel className="px-2 pt-2 pb-1 text-xs font-semibold uppercase text-sidebar-foreground/70 group-data-[collapsible=icon]:text-center">{group.title}</SidebarGroupLabel>}
              {renderNavItems(group.children || [group])}
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2"> {/* Added border and padding */}
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ content: "Settings", side: 'right', align: 'center', className: "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border" }} className="pl-2">
              <Link href={`/${role}/settings`}>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip={{ content: "Logout", side: 'right', align: 'center', className: "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border" }} className="pl-2">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
