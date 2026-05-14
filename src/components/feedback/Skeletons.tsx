import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="card-glass p-6 gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-3 w-16" />
        </Card>
      ))}
    </div>
  )
}

export function PrescriptionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="card-glass overflow-hidden p-0 gap-0">
      <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-lowest/50 flex gap-6">
        {['Patient', 'RX Code', 'Medications', 'Status', 'Date', 'Actions'].map((h) => (
          <Skeleton key={h} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 border-b border-outline-variant/20 flex gap-6 items-center"
        >
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-6 flex-1 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </Card>
  )
}

export function PrescriptionCardListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="glass-panel p-6 gap-4">
          <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
            <div className="flex flex-col gap-2 w-1/3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ))}
    </div>
  )
}
