import { Card } from "@/components/ui/card";

// Decorative-only trend visualization. Backed by a static polygon today;
// swap to metrics.byDay when the design adds a real timeseries chart.
export function VolumeTrendsChart() {
  return (
    <Card className="card-glass lg:col-span-2 p-6 gap-0">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="text-xl font-semibold text-primary">
          Volume Trends (30 Days)
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-surface-variant/50 text-on-surface text-xs font-semibold rounded hover:bg-surface-variant transition-colors"
          >
            1W
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-primary text-on-primary text-xs font-semibold rounded"
          >
            1M
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-surface-variant/50 text-on-surface text-xs font-semibold rounded hover:bg-surface-variant transition-colors"
          >
            3M
          </button>
        </div>
      </div>
      <div className="relative h-64 w-full flex items-end pt-4">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-on-surface-variant text-xs w-8">
          <span>15k</span>
          <span>10k</span>
          <span>5k</span>
          <span>0</span>
        </div>
        <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between">
          <div className="border-t border-outline-variant/20 w-full" />
          <div className="border-t border-outline-variant/20 w-full" />
          <div className="border-t border-outline-variant/20 w-full" />
          <div className="border-t border-outline-variant/40 w-full" />
        </div>
        <div className="relative w-full h-[calc(100%-24px)] ml-10 overflow-hidden flex items-end">
          <div
            className="absolute bottom-0 left-0 right-0 top-1/4 bg-gradient-to-t from-primary/10 to-primary/0 border-t-2 border-primary"
            style={{
              clipPath:
                "polygon(0 40%, 10% 45%, 20% 30%, 30% 50%, 40% 20%, 50% 35%, 60% 15%, 70% 25%, 80% 5%, 90% 10%, 100% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>
        <div className="absolute bottom-0 left-10 right-0 flex justify-between text-on-surface-variant text-xs pt-2">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span>Day 30</span>
        </div>
      </div>
    </Card>
  );
}
