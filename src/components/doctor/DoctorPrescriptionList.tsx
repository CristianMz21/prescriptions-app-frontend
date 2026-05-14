'use client'

import Link from 'next/link'
import type { PrescriptionResponseDto } from '@/lib/api/generated/schemas'
import { usePrescriptionsControllerFindAll } from '@/lib/api/generated/prescriptionManagementAPI'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PrescriptionTable } from '@/components/prescription/PrescriptionTable'
import { buttonVariants } from '@/components/ui/button'
import { routes } from '@/lib/routes'

export function DoctorPrescriptionList() {
  const { data, isLoading, error } = usePrescriptionsControllerFindAll()

  if (isLoading) return <LoadingState label="Loading prescriptions" />
  if (error) return <ErrorState message={error.message} />

  const prescriptions = (data?.data as PrescriptionResponseDto[] | undefined) ?? []

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary">Active Prescriptions</h2>
          <p className="text-base text-on-surface-variant mt-1">
            Manage and monitor pending and active scripts.
          </p>
        </div>
        <Link href={routes.doctor.newPrescription} className={buttonVariants()}>
          <span className="material-symbols-outlined text-lg">add</span>
          New Prescription
        </Link>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState icon="medication" title="No prescriptions found" />
      ) : (
        <PrescriptionTable
          prescriptions={prescriptions}
          getDetailHref={(id) => `${routes.doctor.prescriptions}/${id}`}
          meta={data?.meta}
        />
      )}
    </div>
  )
}
