import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  footer?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  footer,
  className,
}: MetricCardProps) {
  return (
    <Card
      data-testid="metric-card"
      data-metric-label={label}
      className={cn(
        "card-glass p-6 relative overflow-hidden group hover:bg-surface-container-low transition-colors gap-0",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="label-uppercase">{label}</span>
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <div className="text-5xl font-bold text-primary tabular-nums">
        {value}
      </div>
      {footer ? (
        <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
