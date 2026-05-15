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

interface MetricsContentProps {
  live?: boolean;
}

export function MetricsContent({ live = true }: MetricsContentProps = {}) {
  const { data: metrics, isLoading, error, refetch } = useAdminGetMetrics();
  useMetricsStream(live);

  if (isLoading) {
    return (
      <div
        data-testid="metrics-overview"
        className="max-w-[1440px] mx-auto w-full px-1 md:px-2 lg:px-3"
      >
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            System Overview
          </h2>
          <p className="text-base text-on-surface-variant mt-1">
            Real-time metrics for network operations.
          </p>
        </header>
        <MetricCardsSkeleton />
      </div>
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
    <div
      data-testid="metrics-overview"
      className="max-w-[1440px] mx-auto w-full px-1 md:px-2 lg:px-3 space-y-7"
    >
      <header className="mb-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          System Overview
        </h2>
        <p className="text-base text-on-surface-variant mt-1">
          Real-time metrics for network operations.
        </p>
      </header>

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <VolumeTrendsChart byDay={metrics.byDay} />
        <StatusDistribution metrics={metrics} />
      </div>
      <div className="pt-1">
        <TopDoctorsTable doctors={metrics.topDoctors} />
      </div>
    </div>
  );
}
