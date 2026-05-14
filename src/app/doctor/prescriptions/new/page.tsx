'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import type { PrescriptionItemDto } from '@/lib/api/generated/schemas'
import {
  usePrescriptionsControllerCreate,
  useUsersControllerFindAllPatients,
} from '@/lib/api/generated/prescriptionManagementAPI'
import { ApiError } from '@/lib/api/client'

interface PatientSelect {
  id: string
  email: string
  birthDate?: string
}

export default function NewPrescriptionPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [patientId, setPatientId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PrescriptionItemDto[]>([
    { name: '', dosage: '', quantity: undefined, instructions: '' },
  ])
  const [error, setError] = useState<string | null>(null)

  const { data: patientsData } = useUsersControllerFindAllPatients()

  const createMutation = usePrescriptionsControllerCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries()
        router.push('/doctor/prescriptions')
      },
      onError: (err: ApiError) => {
        setError(err.message || 'Failed to create prescription')
      },
    },
  })

  const handleAddItem = () => {
    setItems([...items, { name: '', dosage: '', quantity: undefined, instructions: '' }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof PrescriptionItemDto, value: string | number | undefined) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!patientId) {
      setError('Please select a patient')
      return
    }

    const validItems = items.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) {
      setError('At least one medication is required')
      return
    }

    createMutation.mutate({
      data: {
        patientId,
        items: validItems,
        notes: notes || undefined,
      },
    })
  }

  const patients: PatientSelect[] =
    (patientsData as unknown as { data?: PatientSelect[] })?.data ?? []

  return (
    <div className="p-margin-desktop">
      <div className="mb-8">
        <Link
          href="/doctor/prescriptions"
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Prescriptions
        </Link>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Issue New Prescription</h2>
        <p className="text-base text-on-surface-variant mt-2">Complete the form below to authorize medication.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <section className="card-glass p-6">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">person_search</span>
            Patient Selection
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">PATIENT</label>
            <div className="relative">
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2.5 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                required
              >
                <option value="">Select a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.email}
                    {patient.birthDate ? ` (${patient.birthDate})` : ''}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none">arrow_drop_down</span>
            </div>
          </div>
        </section>

        <section className="card-glass p-6">
          <div className="flex justify-between items-end border-b border-outline-variant/50 pb-2 mb-6">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">vaccines</span>
              Medication Details
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-primary text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-4 relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-4 right-4 text-outline hover:text-error transition-colors"
                  disabled={items.length === 1}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 pr-8">
                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">MEDICATION NAME</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="e.g., Amoxicillin"
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">DOSAGE</label>
                    <input
                      type="text"
                      value={item.dosage || ''}
                      onChange={(e) => handleItemChange(index, 'dosage', e.target.value || undefined)}
                      placeholder="e.g., 500mg"
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">DISPENSE QUANTITY</label>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      placeholder="Qty"
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">PATIENT INSTRUCTIONS (SIG)</label>
                  <input
                    type="text"
                    value={item.instructions || ''}
                    onChange={(e) => handleItemChange(index, 'instructions', e.target.value || undefined)}
                    placeholder="e.g., Take one tablet by mouth twice daily"
                    className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card-glass p-6">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">note_alt</span>
            Clinical Notes &amp; Authorization
          </h3>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">INTERNAL NOTES (NOT PRINTED ON SCRIPT)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add diagnosis codes or internal context..."
                rows={3}
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-3 py-2 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container/10 border border-error rounded text-sm text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/30">
            <Link
              href="/doctor/prescriptions"
              className="bg-transparent border border-white/20 text-on-surface hover:bg-white/5 hover:border-white/40 px-6 py-2.5 rounded text-sm font-medium transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-black px-8 py-2.5 rounded text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_2px_10px_rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Creating...
                </span>
              ) : (
                'Issue Prescription'
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}