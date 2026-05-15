"use client";

import { useAdminGetMetrics } from "@/lib/api/generated/prescriptionManagementAPI";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricCardsSkeleton } from "@/components/feedback/Skeletons";
import { useMetricsStream } from "@/lib/hooks/useMetricsStream";
import { MetricsGrid } from "./MetricsGrid";
import { StatusDistribution } from "./StatusDistribution";
import { VolumeTrendsChart } from "./VolumeTrendsChart";
import { TopDoctorsTable } from "./TopDoctorsTable";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

interface MetricsContentProps {
  live?: boolean;
}

export function MetricsContent({ live = true }: MetricsContentProps = {}) {
  const { data: metrics, isLoading, error, refetch } = useAdminGetMetrics();
  useMetricsStream(live);

  if (isLoading) {
    return (
      <PageShell data-testid="metrics-overview">
        <PageHeader
          title="System Overview"
          description="Real-time metrics for network operations."
        />
        <MetricCardsSkeleton />
      </PageShell>
    );
  }
  if (error)
    return (
      <ErrorState
        message={error.message}
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    );
  if (!metrics) return null;

  return (
    <PageShell data-testid="metrics-overview" className="space-y-7">
      <PageHeader
        title="System Overview"
        description="Real-time metrics for network operations."
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <VolumeTrendsChart byDay={metrics.byDay} />
        <StatusDistribution metrics={metrics} />
      </div>
      <div className="pt-1">
        <TopDoctorsTable doctors={metrics.topDoctors} />
      </div>
    </PageShell>
  );
}
