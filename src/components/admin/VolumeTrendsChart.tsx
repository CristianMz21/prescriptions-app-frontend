import { Card } from "@/components/ui/card";
import type { MetricsByDayItemDto } from "@/lib/api/generated/schemas";

interface VolumeTrendsChartProps {
  byDay: MetricsByDayItemDto[];
}

export function VolumeTrendsChart({ byDay }: VolumeTrendsChartProps) {
  const rawSeries = (byDay ?? [])
    .slice(-30)
    .map((d) => ({
      date: String(d.date ?? ""),
      count: Number(d.count ?? 0),
    }))
    .filter((d) => Number.isFinite(d.count));

  // Fill missing days so the 30-day panel always renders meaningful bars.
  const today = new Date();
  const fallbackDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    return date.toISOString().slice(0, 10);
  });
  const rawMap = new Map(rawSeries.map((d) => [d.date.slice(0, 10), d.count]));
  const series = fallbackDates.map((date) => ({
    date,
    count: rawMap.get(date) ?? 0,
  }));

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
      <div className="h-64 w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest/20 p-3">
        <div className="h-full w-full">
          {rawSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
              No trend data
            </div>
          ) : (
            <div className="h-full flex items-end gap-1">
              {series.map((point) => (
                <div
                  key={point.date}
                  className="flex-1 rounded-t bg-primary/80 hover:bg-primary transition-colors"
                  style={{
                    height: `${Math.max(3, (point.count / max) * 100)}%`,
                  }}
                  title={`${point.date}: ${point.count}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
