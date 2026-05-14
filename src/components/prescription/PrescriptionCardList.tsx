'use client'

import Link from 'next/link'
import type { PrescriptionResponseDto } from '@/lib/api/generated/schemas'
import { usePrescriptionsControllerFindAll } from '@/lib/api/generated/prescriptionManagementAPI'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PrescriptionCardListSkeleton } from '@/components/feedback/Skeletons'
import { buttonVariants } from '@/components/ui/button'
import { routes } from '@/lib/routes'
import { PrescriptionCard } from './PrescriptionCard'
import { PdfDownloadButton } from './PdfDownloadButton'
import { ConsumePrescriptionButton } from './ConsumePrescriptionButton'

export function PrescriptionCardList() {
  const { data, isLoading, error } = usePrescriptionsControllerFindAll()

  if (isLoading) return <PrescriptionCardListSkeleton />
  if (error) return <ErrorState message={error.message} />

  // Orval emits data as the union from PaginatedResultDto allOf — narrow to the
  // concrete prescription DTO via a single cast at the data boundary.
  const prescriptions = (data?.data as PrescriptionResponseDto[] | undefined) ?? []
  if (prescriptions.length === 0) {
    return <EmptyState icon="medication" title="No prescriptions found" />
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {prescriptions.map((rx) => (
        <PrescriptionCard
          key={rx.id}
          prescription={rx}
          actions={
            <>
              <Link
                href={routes.patient.detail(rx.id)}
                className={buttonVariants({ variant: 'outline' })}
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                View Details
              </Link>
              <PdfDownloadButton prescriptionId={rx.id} />
              {rx.status === 'PENDING' ? (
                <ConsumePrescriptionButton prescriptionId={rx.id} />
              ) : null}
            </>
          }
        />
      ))}
    </div>
  )
}
