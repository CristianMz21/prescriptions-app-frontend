'use client'

import { useQuery } from '@tanstack/react-query'
import type { MetricsResponseDto } from '@/lib/api/generated/schemas'
import { api } from '@/lib/api/client'
import { ApiError } from '@/lib/api/custom-instance'

export function MetricsContent() {
  const { data: metrics, isLoading, error } = useQuery<MetricsResponseDto, ApiError>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await api.adminControllerGetMetrics()
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

  if (!metrics) {
    return null
  }

  return (
    <div className="max-w-container-max mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">System Overview</h2>
        <p className="text-base text-on-surface-variant mt-1">Real-time metrics for network operations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6 relative overflow-hidden group hover:bg-[#18181B] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Prescriptions</span>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">medication</span>
          </div>
          <div className="text-5xl font-bold text-primary tabular-nums">{metrics.totals.prescriptions}</div>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            <span>Total issued</span>
          </div>
        </div>

        <div className="bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6 relative overflow-hidden group hover:bg-[#18181B] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Patients</span>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">group</span>
          </div>
          <div className="text-5xl font-bold text-primary tabular-nums">{metrics.totals.patients}</div>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            <span>Registered</span>
          </div>
        </div>

        <div className="bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6 relative overflow-hidden group hover:bg-[#18181B] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Doctors</span>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">local_hospital</span>
          </div>
          <div className="text-5xl font-bold text-primary tabular-nums">{metrics.totals.doctors}</div>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            <span>On duty</span>
          </div>
        </div>

        <div className="bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6 relative overflow-hidden group hover:bg-[#18181B] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Prescription Status</span>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">analytics</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface">Pending</span>
              <span className="text-sm font-semibold text-primary tabular-nums">{metrics.byStatus.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface">Consumed</span>
              <span className="text-sm font-semibold text-primary tabular-nums">{metrics.byStatus.consumed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
            <h3 className="text-xl font-semibold text-primary">Volume Trends (30 Days)</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-variant/50 text-on-surface text-xs font-semibold rounded hover:bg-surface-variant transition-colors">1W</button>
              <button className="px-3 py-1 bg-primary text-on-primary text-xs font-semibold rounded">1M</button>
              <button className="px-3 py-1 bg-surface-variant/50 text-on-surface text-xs font-semibold rounded hover:bg-surface-variant transition-colors">3M</button>
            </div>
          </div>
          <div className="relative h-64 w-full flex items-end pt-4">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-on-surface-variant text-xs w-8">
              <span>15k</span>
              <span>10k</span>
              <span>5k</span>
              <span>0</span>
            </div>
            <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between">
              <div className="border-t border-outline-variant/20 w-full" />
              <div className="border-t border-outline-variant/20 w-full" />
              <div className="border-t border-outline-variant/20 w-full" />
              <div className="border-t border-outline-variant/40 w-full" />
            </div>
            <div className="relative w-full h-[calc(100%-24px)] ml-10 overflow-hidden flex items-end">
              <div
                className="absolute bottom-0 left-0 right-0 top-1/4 bg-gradient-to-t from-primary/10 to-primary/0 border-t-2 border-primary"
                style={{
                  clipPath: 'polygon(0 40%, 10% 45%, 20% 30%, 30% 50%, 40% 20%, 50% 35%, 60% 15%, 70% 25%, 80% 5%, 90% 10%, 100% 0, 100% 100%, 0 100%)'
                }}
              />
            </div>
            <div className="absolute bottom-0 left-10 right-0 flex justify-between text-on-surface-variant text-xs pt-2">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>

        <div className="bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg p-6">
          <div className="mb-6 pb-4 border-b border-outline-variant/30">
            <h3 className="text-xl font-semibold text-primary">Distribution by Status</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-full pb-8">
            <div className="relative w-48 h-48 rounded-full border-[16px] border-surface-variant mb-6">
              <div
                className="absolute inset-[-16px] rounded-full border-[16px] border-primary"
                style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)', transform: 'rotate(-45deg)' }}
              />
              <div
                className="absolute inset-[-16px] rounded-full border-[16px] border-on-surface-variant"
                style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)', transform: 'rotate(0deg)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-semibold text-primary tabular-nums">{metrics.totals.prescriptions}</span>
                <span className="text-xs text-on-surface-variant">Total</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="text-on-surface">Consumed</span>
                </div>
                <span className="text-on-surface-variant tabular-nums">{metrics.byStatus.consumed}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-on-surface-variant" />
                  <span className="text-on-surface">Pending</span>
                </div>
                <span className="text-on-surface-variant tabular-nums">{metrics.byStatus.pending}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {metrics.topDoctors && metrics.topDoctors.length > 0 && (
        <div className="mt-6 bg-[#09090B]/80 backdrop-blur-[12px] border border-[#27272A] rounded-lg">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="text-xl font-semibold text-primary">Top Doctors</h3>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {metrics.topDoctors.map((doctor, index) => (
              <div key={doctor.authorId} className="p-4 flex items-center hover:bg-[#18181B] transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center mr-4">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-on-surface">Doctor</span>
                  <p className="text-xs text-on-surface-variant font-mono">{doctor.authorId}</p>
                </div>
                <span className="text-sm font-semibold text-primary tabular-nums">{doctor.count} prescriptions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}