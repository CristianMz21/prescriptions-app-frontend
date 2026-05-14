'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { PrescriptionResponseDto, PrescriptionsControllerFindAll200 } from '@/lib/api/generated/schemas'
import { api } from '@/lib/api/client'
import { ApiError } from '@/lib/api/custom-instance'

export default function DoctorPrescriptionsPage() {
  const { data, isLoading, error } = useQuery<PrescriptionsControllerFindAll200, ApiError>({
    queryKey: ['doctor-prescriptions'],
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary">Active Prescriptions</h2>
          <p className="text-base text-on-surface-variant mt-1">Manage and monitor pending and active scripts.</p>
        </div>
        <Link
          href="/doctor/prescriptions/new"
          className="bg-primary text-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Prescription
        </Link>
      </div>

      {prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl">medication</span>
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="bg-[#09090B]/80 backdrop-blur-xl border border-[#27272A] rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] bg-surface-container-lowest/50">
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Patient</th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">RX Code</th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Medications</th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-primary">
                        {prescription.patient?.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-mono text-on-surface">{prescription.code}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-on-surface">
                        {prescription.items?.map((item) => item.name).join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                        prescription.status === 'PENDING'
                          ? 'border-outline-variant bg-surface-container'
                          : 'border-outline-variant/50 bg-surface-container/50'
                      }`}>
                        <span className={`material-symbols-outlined text-sm ${
                          prescription.status === 'PENDING' ? 'text-primary' : 'text-primary'
                        }`} style={{ fontVariationSettings: prescription.status === 'PENDING' ? "'FILL' 1" : "'FILL' 0" }}>
                          {prescription.status === 'PENDING' ? 'radio_button_checked' : 'done_all'}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {prescription.status === 'PENDING' ? 'Pending' : 'Consumed'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 tabular-nums text-sm text-on-surface">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/doctor/prescriptions/${prescription.id}`}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.meta && (
            <div className="border-t border-[#27272A] p-4 flex items-center justify-between bg-surface-container-lowest/30">
              <div className="text-xs font-semibold text-on-surface-variant">
                Showing {prescriptions.length} of {data.meta.total} prescriptions
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded border border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors disabled:opacity-50"
                  disabled={data.meta.page <= 1}
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="text-xs font-semibold text-on-surface tabular-nums">
                  Page {data.meta.page} of {data.meta.totalPages}
                </div>
                <button
                  className="w-8 h-8 rounded border border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors disabled:opacity-50"
                  disabled={data.meta.page >= data.meta.totalPages}
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}