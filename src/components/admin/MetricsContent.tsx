"use client";

import { useAdminGetMetrics } from "@/lib/api/generated/prescriptionManagementAPI";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricCardsSkeleton } from "@/components/feedback/Skeletons";
import { useMetricsStream } from "@/lib/hooks/useMetricsStream";
import { MetricsGrid } from "./MetricsGrid";
import { StatusDistribution } from "./StatusDistribution";
import { VolumeTrendsChart } from "./VolumeTrendsChart";
import { TopDoctorsTable } from "./TopDoctorsTable";

interface MetricsContentProps {
  live?: boolean;
}

export function MetricsContent({ live = true }: MetricsContentProps = {}) {
  const { data: metrics, isLoading, error } = useAdminGetMetrics();
  useMetricsStream(live);

  if (isLoading) {
    return (
      <div
        data-testid="metrics-overview"
        className="max-w-[1440px] mx-auto w-full"
      >
        <header className="mb-8">
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
  if (error) return <ErrorState message={error.message} />;
  if (!metrics) return null;

  return (
    <div
      data-testid="metrics-overview"
      className="max-w-[1440px] mx-auto w-full"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          System Overview
        </h2>
        <p className="text-base text-on-surface-variant mt-1">
          Real-time metrics for network operations.
        </p>
      </header>

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VolumeTrendsChart byDay={metrics.byDay} />
        <StatusDistribution metrics={metrics} />
      </div>

      <TopDoctorsTable doctors={metrics.topDoctors} />
    </div>
  );
}
