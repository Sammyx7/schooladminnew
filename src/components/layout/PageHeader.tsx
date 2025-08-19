import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon; 
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className={cn("mb-4 sm:mb-6 flex w-full min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4")}>
      <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3">
        {Icon && ( 
          <div className="hidden sm:block">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-foreground truncate">{title}</h1>
          {description && (
            <p className="hidden sm:block mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap justify-start sm:justify-end shrink sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
