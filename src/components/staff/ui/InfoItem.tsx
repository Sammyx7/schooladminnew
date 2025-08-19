"use client";

interface InfoItemProps {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}

export function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
      <div className="text-sm min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium break-words">{value ?? '-'}</div>
      </div>
    </div>
  );
}

export default InfoItem;
