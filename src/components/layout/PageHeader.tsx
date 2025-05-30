
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">{/* Increased mb */}
      <div>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary" />}{/* Increased icon size */}
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>{/* Increased title size */}
        </div>
        {description && (
          <p className="mt-2 text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
