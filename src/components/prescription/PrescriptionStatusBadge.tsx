import type { PrescriptionStatus } from "@/lib/api/generated/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_META } from "./prescriptionStatusMeta";

interface PrescriptionStatusBadgeProps {
  status: PrescriptionStatus;
  className?: string;
}

export function PrescriptionStatusBadge({
  status,
  className,
}: PrescriptionStatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      data-testid="status-badge"
      data-status={status}
      className={cn(
        "gap-1.5 rounded-full px-3 py-1 bg-surface-container/50 uppercase tracking-widest text-[0.7rem] font-semibold",
        meta.tone,
        className,
      )}
    >
      <span
        className="material-symbols-outlined text-base"
        style={{ fontVariationSettings: meta.filled ? "'FILL' 1" : "'FILL' 0" }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </Badge>
  );
}
