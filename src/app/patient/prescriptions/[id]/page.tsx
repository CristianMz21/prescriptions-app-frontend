'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api/client'
import {
  usePrescriptionsControllerFindOne,
  usePrescriptionsControllerMarkAsConsumed,
} from '@/lib/api/generated/prescriptionManagementAPI'

export default function PatientPrescriptionDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const prescriptionId = params.id as string

  const {
    data: prescription,
    isLoading,
    error,
  } = usePrescriptionsControllerFindOne(prescriptionId)

  const consumeMutation = usePrescriptionsControllerMarkAsConsumed({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries()
      },
    },
  })

  const handleDownloadPdf = () => {
    window.open(`${API_BASE_URL}/prescriptions/${prescriptionId}/pdf`, '_blank')
  }

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
        <Link href="/patient/prescriptions" className="text-primary hover:underline">
          Back to prescriptions
        </Link>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-on-surface-variant">Prescription not found</p>
        <Link href="/patient/prescriptions" className="text-primary hover:underline">
          Back to prescriptions
        </Link>
      </div>
    )
  }

  const isPending = prescription.status === 'PENDING'

  return (
    <div className="p-margin-desktop max-w-3xl mx-auto">
      <Link
        href="/patient/prescriptions"
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-8"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to My Prescriptions
      </Link>

      <div className="glass-panel rounded-xl p-6 relative group overflow-hidden mb-8">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-surface-variant' : 'bg-primary'}`} />

        <div className="flex flex-col gap-6 pl-2">
          <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">RX Number</span>
              <span className="text-lg font-medium text-primary font-mono tracking-wider">{prescription.code}</span>
            </div>
            <div className={`flex items-center gap-2 border rounded-full px-3 py-1 ${
              isPending ? 'border-outline-variant bg-surface-container-lowest/50' : 'border-primary/50 bg-surface-container/50'
            }`}>
              <span className={`material-symbols-outlined text-base ${isPending ? 'text-on-surface-variant' : 'text-primary'}`} style={{ fontVariationSettings: isPending ? "'FILL' 0" : "'FILL' 1" }}>
                {isPending ? 'pending_actions' : 'check_circle'}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${isPending ? 'text-on-surface-variant' : 'text-primary'}`}>
                {prescription.status === 'PENDING' ? 'Pending' : 'Consumed'}
              </span>
            </div>
          </div>

          {prescription.items && prescription.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-primary">
                  {prescription.items[0].name}
                  {prescription.items[0].dosage && <span className="text-on-surface-variant"> {prescription.items[0].dosage}</span>}
                </h3>
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-1">Instructions</span>
                  <p className="text-base text-on-surface">{prescription.items[0].instructions || 'No instructions provided'}</p>
                </div>
                {prescription.items[0].quantity && (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">inventory_2</span>
                    Quantity: {prescription.items[0].quantity}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 border-l-0 md:border-l border-outline-variant/30 md:pl-8 pt-4 md:pt-0">
                {prescription.author && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Prescribed By</span>
                    <span className="text-base text-on-surface">
                      {prescription.author.signatureText || prescription.author.user?.email || 'N/A'}
                    </span>
                    {prescription.author.specialty && (
                      <span className="text-xs text-on-surface-variant">{prescription.author.specialty}</span>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Date Issued</span>
                  <span className="text-base text-on-surface tabular-nums">
                    {new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {prescription.consumedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Consumed On</span>
                    <span className="text-base text-primary tabular-nums">
                      {new Date(prescription.consumedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {prescription.notes && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Notes</span>
              <p className="text-base text-on-surface">{prescription.notes}</p>
            </div>
          )}

          <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-outline-variant/20">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded border border-outline/20 text-on-surface text-sm font-medium hover:bg-surface-variant/30 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download PDF
            </button>
            {isPending && (
              <button
                onClick={() =>
                  consumeMutation.mutate({ id: prescriptionId, data: {} })
                }
                disabled={consumeMutation.isPending}
                className="px-6 py-2 rounded bg-primary text-on-primary text-sm font-medium hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {consumeMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check</span>
                    Mark as Consumed
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {prescription.items && prescription.items.length > 1 && (
        <div className="glass-panel rounded-xl p-6">
          <h4 className="text-lg font-semibold text-primary mb-4">All Medications</h4>
          <div className="space-y-4">
            {prescription.items.slice(1).map((item, index) => (
              <div key={item.id || index} className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-base font-medium text-primary">{item.name}</span>
                    {item.dosage && <span className="text-sm text-on-surface-variant ml-2">{item.dosage}</span>}
                  </div>
                  {item.quantity && (
                    <span className="text-xs text-on-surface-variant">Qty: {item.quantity}</span>
                  )}
                </div>
                {item.instructions && (
                  <p className="text-sm text-on-surface-variant mt-1">{item.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}