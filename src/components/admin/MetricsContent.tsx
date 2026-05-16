"use client";

import { useAdminGetMetrics } from "@/lib/api/generated/prescriptionManagementAPI";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricCardsSkeleton } from "@/components/feedback/Skeletons";
import { useMetricsStream } from "@/lib/hooks/useMetricsStream";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { MetricsGrid } from "./MetricsGrid";
import { StatusDistribution } from "./StatusDistribution";
import { VolumeTrendsChart } from "./VolumeTrendsChart";
import { TopDoctorsTable } from "./TopDoctorsTable";
import {
  MetricsFilters,
  type MetricsFilterValues,
} from "./MetricsFilters";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

interface MetricsContentProps {
  live?: boolean;
}

const FILTER_KEYS = ["fromDate", "toDate"] as const;

export function MetricsContent({ live = true }: MetricsContentProps = {}) {
  const { values, setFilters, clear } =
    useUrlFilters<(typeof FILTER_KEYS)[number]>(FILTER_KEYS);
  const { data: metrics, isLoading, error, refetch } = useAdminGetMetrics({
    fromDate: values.fromDate,
    toDate: values.toDate,
  });
  useMetricsStream(live);

  const handleChange = (patch: Partial<MetricsFilterValues>) =>
    setFilters(
      patch as Partial<
        Record<(typeof FILTER_KEYS)[number], string | undefined>
      >,
    );

  if (isLoading) {
    return (
      <PageShell data-testid="metrics-overview" className="space-y-7">
        <PageHeader
          title="System Overview"
          description="Real-time metrics for network operations."
        />
        <MetricsFilters
          values={values}
          onChange={handleChange}
          onClear={clear}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              refetch().catch(() => undefined);
            }}
          >
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

      <MetricsFilters
        values={values}
        onChange={handleChange}
        onClear={clear}
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
