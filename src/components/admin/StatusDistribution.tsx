import type { MetricsResponseDto } from "@/lib/api/generated/schemas";
import { Card } from "@/components/ui/card";

interface StatusDistributionProps {
  metrics: MetricsResponseDto;
}

export function StatusDistribution({ metrics }: StatusDistributionProps) {
  const total = Math.max(1, metrics.totals.prescriptions);
  const consumedPct = Math.round((metrics.byStatus.consumed / total) * 100);
  const pendingPct = Math.round((metrics.byStatus.pending / total) * 100);

  return (
    <Card className="card-glass p-6 gap-0">
      <div className="mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="text-xl font-semibold text-primary">
          Distribution by Status
        </h3>
      </div>
      <div className="flex flex-col justify-center h-full gap-4">
        <div className="text-center mb-2">
          <span className="text-xl font-semibold text-primary tabular-nums">
            {metrics.totals.prescriptions}
          </span>
          <span className="block text-xs text-on-surface-variant">Total</span>
        </div>
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>Consumed</span>
            </div>
            <span className="text-on-surface-variant tabular-nums text-right">
              {metrics.byStatus.consumed} ({consumedPct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-variant/30 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${consumedPct}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-on-surface-variant" />
              <span>Pending</span>
            </div>
            <span className="text-on-surface-variant tabular-nums text-right">
              {metrics.byStatus.pending} ({pendingPct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-variant/30 overflow-hidden">
            <div
              className="h-full bg-on-surface-variant"
              style={{ width: `${pendingPct}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
