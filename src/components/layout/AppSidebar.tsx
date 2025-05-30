
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
          isActive={pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))}
          tooltip={item.title}
          className={isSubmenu ? "pl-8" : ""}
        >
          <Link href={item.href}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.children && item.children.length > 0 && (
          <SidebarMenu className="pl-4"> {/* Indent sub-menu items visually */}
            {renderNavItems(item.children, true)}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    ));
  };


  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <Link href={`/${role}/dashboard`} className="flex items-center gap-2 p-2 hover:bg-sidebar-accent rounded-md">
          <School className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            SchoolAdmin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((group, index) => (
            <SidebarGroup key={index}>
              {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
              {renderNavItems(group.children || [group])}
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href={`/${role}/settings`}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
