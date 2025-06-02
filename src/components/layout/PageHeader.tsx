
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
    <div className={cn("mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full")}> {/* Added w-full */}
      <div className="flex-1"> {/* Added flex-1 to allow this block to grow */}
        {Icon && ( 
          <div className="mb-1">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>} {/* Added shrink-0 to actions */}
    </div>
  );
}
