'use client'

import { useAdminControllerGetMetrics } from '@/lib/api/generated/prescriptionManagementAPI'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { MetricsGrid } from './MetricsGrid'
import { StatusDistribution } from './StatusDistribution'
import { VolumeTrendsChart } from './VolumeTrendsChart'
import { TopDoctorsTable } from './TopDoctorsTable'

export function MetricsContent() {
  const { data: metrics, isLoading, error } = useAdminControllerGetMetrics()

  if (isLoading) return <LoadingState label="Loading metrics" />
  if (error) return <ErrorState message={error.message} />
  if (!metrics) return null

  return (
    <div data-testid="metrics-overview" className="max-w-container-max mx-auto w-full">
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
        <VolumeTrendsChart />
        <StatusDistribution metrics={metrics} />
      </div>

      <TopDoctorsTable doctors={metrics.topDoctors} />
    </div>
  )
}
