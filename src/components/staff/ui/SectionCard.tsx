"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, description, actions, children, className }: SectionCardProps) {
  return (
    <Card className={cn("w-full border shadow-md rounded-xl", className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 sm:p-6 pb-0">
          <div>
            {title && <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">{title}</CardTitle>}
            {description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-4 sm:p-6">
        {children}
      </CardContent>
    </Card>
  );
}

export default SectionCard;
