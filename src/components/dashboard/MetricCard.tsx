
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  bgColorClass: string; // e.g., 'bg-[hsl(var(--metric-card-green-bg))]'
  iconColorClass: string; // e.g., 'text-[hsl(var(--metric-card-green-icon))]'
  valueColorClass?: string; // e.g., 'text-[hsl(var(--metric-card-green-value))]'
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  bgColorClass,
  iconColorClass,
  valueColorClass,
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("shadow-md border", bgColorClass, className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-1.5 rounded-full bg-opacity-20", bgColorClass === 'bg-[hsl(var(--metric-card-green-bg))]' ? 'bg-green-500/20' : 
                                     bgColorClass === 'bg-[hsl(var(--metric-card-blue-bg))]' ? 'bg-blue-500/20' :
                                     bgColorClass === 'bg-[hsl(var(--metric-card-red-bg))]' ? 'bg-red-500/20' :
                                     bgColorClass === 'bg-[hsl(var(--metric-card-purple-bg))]' ? 'bg-purple-500/20' : '')}>
          <Icon className={cn("h-5 w-5", iconColorClass)} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={cn("text-3xl font-bold", valueColorClass || 'text-foreground')}>{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
