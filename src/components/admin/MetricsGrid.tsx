import type { MetricsResponseDto } from "@/lib/api/generated/schemas";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { AppIcon } from "@/components/icons/AppIcon";

interface MetricsGridProps {
  metrics: MetricsResponseDto;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      <MetricCard
        label="Total Prescriptions"
        value={metrics.totals.prescriptions}
        icon="pill"
        footer={
          <>
            <AppIcon name="trendingUp" size="xs" />
            <span>Total issued</span>
          </>
        }
      />
      <MetricCard
        label="Active Patients"
        value={metrics.totals.patients}
        icon="users"
        footer={
          <>
            <AppIcon name="trendingUp" size="xs" />
            <span>Registered</span>
          </>
        }
      />
      <MetricCard
        label="Active Doctors"
        value={metrics.totals.doctors}
        icon="hospital"
        footer={
          <>
            <AppIcon name="trendingUp" size="xs" />
            <span>On duty</span>
          </>
        }
      />
      <Card
        data-testid="metric-card"
        data-metric-label="Prescription Status"
        className="card-glass p-6 group hover:bg-surface-container-low transition-colors gap-0"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="label-uppercase">Prescription Status</span>
          <AppIcon
            name="barChart3"
            className="text-on-surface-variant group-hover:text-primary transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Pending</span>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {metrics.byStatus.pending}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Consumed</span>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {metrics.byStatus.consumed}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
