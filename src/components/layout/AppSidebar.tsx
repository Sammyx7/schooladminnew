
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
import { LogOut, Settings } from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface AppSidebarProps {
  navItems: NavItem[];
  role: string;
}

export function AppSidebar({ navItems, role }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderNavItems = (items: NavItem[], isSubmenu = false, groupTitle?: string) => {
    return items.map((item) => {
      // For top-level items that are groups, their href might be a parent path.
      // For direct nav items, exact match or startsWith for children.
      const isActive = item.children && item.children.length > 0 
        ? pathname.startsWith(item.href)
        : pathname === item.href;

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
            className={isSubmenu ? "pl-10 pr-2 py-2 h-auto text-sm" : "pl-3 pr-2 py-2 h-auto text-sm"}
          >
            <Link href={item.href} className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'}`} />
              <span className={`${isActive ? 'font-semibold text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-foreground/90'}`}>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          {isActive && item.children && item.children.length > 0 && (
            <SidebarMenu className="pl-4 mt-1"> {/* Indent sub-menu items visually */}
              {renderNavItems(item.children, true)}
            </SidebarMenu>
          )}
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar 
      collapsible="icon" 
      side="left" 
      variant="sidebar" // This variant makes it sit on the side, not floating
      className="border-r border-sidebar-border bg-sidebar-background fixed left-0 top-16 bottom-0 z-30" // fixed position below TopHeader
      style={{ width: 'var(--sidebar-width)', transition: 'width 0.2s' }} // Ensure width is applied
    >
      {/* SidebarHeader is not used as per the new design where logo is in TopHeader */}
      {/* <SidebarHeader> ... </SidebarHeader> */}
      
      <SidebarContent className="p-2 mt-2"> {/* Added padding to content area */}
        <SidebarMenu>
          {navItems.map((groupItem, index) => {
            // If the item itself is a link and has no children, render it directly.
            // If it has a title (acting as a group label) and children, render group.
            if (!groupItem.children || groupItem.children.length === 0) {
              // Single top-level item
              return renderNavItems([groupItem], false);
            }
            // Item is a group
            return (
              <SidebarGroup key={groupItem.title || index} className="p-0 mb-2">
                {groupItem.title && (
                  <SidebarGroupLabel className="px-3 pt-2 pb-1 text-xs font-medium uppercase text-sidebar-foreground/60 group-data-[collapsible=icon]:text-center">
                    {groupItem.title}
                  </SidebarGroupLabel>
                )}
                {renderNavItems(groupItem.children, false, groupItem.title)}
              </SidebarGroup>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip={{ content: "Settings", side: 'right', align: 'center', className: "bg-primary text-primary-foreground border-none shadow-md" }} 
              className="pl-3 pr-2 py-2 h-auto text-sm"
              isActive={pathname === `/${role}/settings`}
            >
              <Link href={`/${role}/settings`} className="flex items-center gap-3">
                <Settings className={`h-5 w-5 shrink-0 ${pathname === `/${role}/settings` ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'}`} />
                <span className={`${pathname === `/${role}/settings` ? 'font-semibold text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-foreground/90'}`}>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              tooltip={{ content: "Logout", side: 'right', align: 'center', className: "bg-primary text-primary-foreground border-none shadow-md" }} 
              className="pl-3 pr-2 py-2 h-auto text-sm"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 shrink-0 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                <span className="text-sidebar-foreground group-hover:text-sidebar-foreground/90">Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
