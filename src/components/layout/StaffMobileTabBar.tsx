"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { staffNavItems } from "@/lib/navData";
import { cn } from "@/lib/utils";

export function StaffMobileTabBar() {
  const pathname = usePathname();

  // Only show on mobile (md:hidden in container)
  return (
    <nav
      aria-label="Staff bottom navigation"
      className={cn(
        "md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px))",
      }}
   >
      <ul className="flex items-stretch justify-between">
        {staffNavItems.map((item) => {
          const Icon = item.icon as any;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-xs text-muted-foreground",
                  "hover:text-foreground",
                  isActive && "text-primary"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="leading-none">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
