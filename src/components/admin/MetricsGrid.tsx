import type { MetricsResponseDto } from '@/lib/api/generated/schemas'
import { Card } from '@/components/ui/card'
import { MetricCard } from './MetricCard'

interface MetricsGridProps {
  metrics: MetricsResponseDto
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <MetricCard
        label="Total Prescriptions"
        value={metrics.totals.prescriptions}
        icon="medication"
        footer={
          <>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_upward
            </span>
            <span>Total issued</span>
          </>
        }
      />
      <MetricCard
        label="Active Patients"
        value={metrics.totals.patients}
        icon="group"
        footer={
          <>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_upward
            </span>
            <span>Registered</span>
          </>
        }
      />
      <MetricCard
        label="Active Doctors"
        value={metrics.totals.doctors}
        icon="local_hospital"
        footer={
          <>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_upward
            </span>
            <span>On duty</span>
          </>
        }
      />
      <Card className="card-glass p-6 group hover:bg-surface-container-low transition-colors gap-0">
        <div className="flex justify-between items-start mb-4">
          <span className="label-uppercase">Prescription Status</span>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
            analytics
          </span>
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
  )
}
