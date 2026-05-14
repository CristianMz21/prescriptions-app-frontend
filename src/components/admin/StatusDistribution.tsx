import type { MetricsResponseDto } from '@/lib/api/generated/schemas'
import { Card } from '@/components/ui/card'

interface StatusDistributionProps {
  metrics: MetricsResponseDto
}

export function StatusDistribution({ metrics }: StatusDistributionProps) {
  return (
    <Card className="card-glass p-6 gap-0">
      <div className="mb-6 pb-4 border-b border-outline-variant/30">
        <h3 className="text-xl font-semibold text-primary">Distribution by Status</h3>
      </div>
      <div className="flex flex-col items-center justify-center h-full pb-8">
        <div className="relative w-48 h-48 rounded-full border-[16px] border-surface-variant mb-6">
          <div
            className="absolute inset-[-16px] rounded-full border-[16px] border-primary"
            style={{
              clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)',
              transform: 'rotate(-45deg)',
            }}
          />
          <div
            className="absolute inset-[-16px] rounded-full border-[16px] border-on-surface-variant"
            style={{
              clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)',
              transform: 'rotate(0deg)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xl font-semibold text-primary tabular-nums">
              {metrics.totals.prescriptions}
            </span>
            <span className="text-xs text-on-surface-variant">Total</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>Consumed</span>
            </div>
            <span className="text-on-surface-variant tabular-nums">
              {metrics.byStatus.consumed}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-on-surface-variant" />
              <span>Pending</span>
            </div>
            <span className="text-on-surface-variant tabular-nums">
              {metrics.byStatus.pending}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
