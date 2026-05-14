'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { usePrescriptionsControllerFindOne } from '@/lib/api/generated/prescriptionManagementAPI'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PrescriptionDetailPanel } from '@/components/prescription/PrescriptionDetailPanel'
import { PdfDownloadButton } from '@/components/prescription/PdfDownloadButton'
import { ConsumePrescriptionButton } from '@/components/prescription/ConsumePrescriptionButton'
import { routes } from '@/lib/routes'

export default function PatientPrescriptionDetailPage() {
  const params = useParams()
  const prescriptionId = params.id as string

  const { data: prescription, isLoading, error } =
    usePrescriptionsControllerFindOne(prescriptionId)

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={routes.patient.prescriptions}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-8"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to My Prescriptions
      </Link>

      {isLoading ? <LoadingState label="Loading prescription" /> : null}
      {error ? <ErrorState message={error.message} /> : null}
      {!isLoading && !error && !prescription ? (
        <EmptyState icon="medication" title="Prescription not found" />
      ) : null}

      {prescription ? (
        <PrescriptionDetailPanel
          prescription={prescription}
          actions={
            <>
              <PdfDownloadButton prescriptionId={prescription.id} />
              {prescription.status === 'PENDING' ? (
                <ConsumePrescriptionButton prescriptionId={prescription.id} />
              ) : null}
            </>
          }
        />
      ) : null}
    </div>
  )
}
