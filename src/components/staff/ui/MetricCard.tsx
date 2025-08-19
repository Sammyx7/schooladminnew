"use client";

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}

export function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/60 backdrop-blur p-3 sm:p-4 hover:shadow-sm transition-shadow w-full">
      {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
      <div className="min-w-0">
        <div className="text-xs sm:text-sm text-muted-foreground leading-snug">{label}</div>
        <div className="text-base sm:text-lg font-semibold truncate leading-tight">{value}</div>
      </div>
    </div>
  );
}

export default MetricCard;
