'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { PrescriptionResponseDto } from '@/lib/api/generated/schemas'
import type { PrescriptionsControllerFindAll200 } from '@/lib/api/generated/schemas'
import { api } from '@/lib/api/client'
import { ApiError } from '@/lib/api/custom-instance'

export default function PatientPrescriptionsPage() {
  const { data, isLoading, error } = useQuery<PrescriptionsControllerFindAll200, ApiError>({
    queryKey: ['patient-prescriptions'],
    queryFn: async () => {
      const response = await api.prescriptionsControllerFindAll()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <p className="text-error">{error.message}</p>
      </div>
    )
  }

  const prescriptions = (data?.data as PrescriptionResponseDto[] | undefined) || []

  return (
    <div className="p-margin-desktop">
      <div className="mb-12 flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">My Prescriptions</h2>
        <p className="text-base text-on-surface-variant max-w-xl">
          Review your current medications, dosage instructions, and manage consumption records.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl">medication</span>
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-3xl">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  )
}

function PrescriptionCard({ prescription }: { prescription: PrescriptionResponseDto }) {
  const isPending = prescription.status === 'PENDING'

  return (
    <div className="glass-panel rounded-xl p-6 relative group overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-surface-variant group-hover:bg-primary' : 'bg-surface-variant'}`} />

      <div className="flex flex-col gap-6 pl-2">
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">RX Number</span>
            <span className="text-base font-medium text-primary font-mono tracking-wider">{prescription.code}</span>
          </div>
          <div className={`flex items-center gap-2 border rounded-full px-3 py-1 ${
            isPending
              ? 'border-outline-variant bg-surface-container-lowest/50'
              : 'border-outline-variant/50 bg-surface-container/50'
          }`}>
            <span className={`material-symbols-outlined text-base ${isPending ? 'text-on-surface-variant' : 'text-primary'}`} style={{ fontVariationSettings: isPending ? "'FILL' 0" : "'FILL' 1" }}>
              {isPending ? 'pending_actions' : 'check_circle'}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-widest ${isPending ? 'text-on-surface-variant' : 'text-primary'}`}>
              {prescription.status === 'PENDING' ? 'Pending' : 'Consumed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-2">
            {prescription.items && prescription.items.length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-primary">
                  {prescription.items[0].name}
                  {prescription.items[0].dosage && <span className="text-on-surface-variant"> {prescription.items[0].dosage}</span>}
                </h3>
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-1">Instructions</span>
                  <p className="text-base text-on-surface">{prescription.items[0].instructions || 'No instructions provided'}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-8 pt-4 md:pt-0">
            {prescription.author && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Prescribed By</span>
                <span className="text-base text-on-surface">
                  {prescription.author.signatureText || prescription.author.user?.email || 'N/A'}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Date Issued</span>
              <span className="text-base text-on-surface tabular-nums">
                {new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-outline-variant/20">
          <Link
            href={`/patient/prescriptions/${prescription.id}`}
            className="px-4 py-2 rounded border border-outline/20 text-on-surface text-sm font-medium hover:bg-surface-variant/30 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download PDF
          </Link>
          {isPending && (
            <form action={`/patient/prescriptions/${prescription.id}/consume`} method="post">
              <button
                type="submit"
                className="px-6 py-2 rounded bg-primary text-on-primary text-sm font-medium hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                Mark as Consumed
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}