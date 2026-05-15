import { Card } from "@/components/ui/card";
import type { MetricsByDayItemDto } from "@/lib/api/generated/schemas";

interface VolumeTrendsChartProps {
  byDay: MetricsByDayItemDto[];
}

export function VolumeTrendsChart({ byDay }: VolumeTrendsChartProps) {
  const series = byDay?.slice(-30) ?? [];
  const max = Math.max(1, ...series.map((d) => d.count));

  return (
    <Card className="card-glass lg:col-span-2 p-6 gap-0">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="text-xl font-semibold text-primary">
          Volume Trends (30 Days)
        </h3>
        <div className="text-xs text-on-surface-variant tabular-nums">
          Max/day: {max}
        </div>
      </div>
      <div className="h-64 w-full">
        <div className="h-full w-full flex items-end gap-1">
          {series.length === 0 ? (
            <div className="text-sm text-on-surface-variant">No trend data</div>
          ) : (
            series.map((point) => (
              <div
                key={point.date}
                className="flex-1 rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-1"
                title={`${point.date}: ${point.count}`}
                style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
