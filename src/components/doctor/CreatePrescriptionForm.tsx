'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import type {
  PrescriptionItemDto,
  UserEntity,
} from '@/lib/api/generated/schemas'
import {
  usePrescriptionsControllerCreate,
  usersControllerFindOne,
  useUsersControllerFindAllPatients,
} from '@/lib/api/generated/prescriptionManagementAPI'
import { ApiError } from '@/lib/api/client'
import { routes } from '@/lib/routes'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EMPTY_ITEM: PrescriptionItemDto = {
  name: '',
  dosage: '',
  quantity: undefined,
  instructions: '',
}

export function CreatePrescriptionForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PrescriptionItemDto[]>([{ ...EMPTY_ITEM }])
  const [error, setError] = useState<string | null>(null)
  const [isResolvingPatient, setIsResolvingPatient] = useState(false)

  // Fetch a generous page so the dropdown isn't truncated when the patient
  // roster grows. A real product would lazy-load via search; this MVP just
  // fits the seed + e2e-created accounts on a single request.
  const { data: patientsData } = useUsersControllerFindAllPatients({ limit: 200 })
  const patients: UserEntity[] = patientsData?.data ?? []

  const createMutation = usePrescriptionsControllerCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries()
        router.push(routes.doctor.prescriptions)
      },
      onError: (err: ApiError) => {
        setError(err.message || 'Failed to create prescription')
      },
    },
  })

  const handleAddItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  const handleRemoveItem = (index: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const updateItem = (
    index: number,
    field: keyof PrescriptionItemDto,
    value: string | number | undefined,
  ) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!selectedUserId) {
      setError('Please select a patient')
      return
    }
    const validItems = items.filter((item) => item.name.trim() !== '')
    if (validItems.length === 0) {
      setError('At least one medication is required')
      return
    }

    // The patient list endpoint returns User records but
    // CreatePrescriptionDto.patientId requires the Patient profile id, so we
    // resolve it via the single-user endpoint before submitting.
    setIsResolvingPatient(true)
    let patientProfileId: string
    try {
      const fullUser = await usersControllerFindOne(selectedUserId)
      if (!fullUser.patient?.id) {
        setError('Selected user has no patient profile')
        return
      }
      patientProfileId = fullUser.patient.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve patient')
      return
    } finally {
      setIsResolvingPatient(false)
    }

    createMutation.mutate({
      data: {
        patientId: patientProfileId,
        items: validItems,
        notes: notes || undefined,
      },
    })
  }

  const isSubmitting = createMutation.isPending || isResolvingPatient

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href={routes.doctor.prescriptions}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider w-fit mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Prescriptions
        </Link>
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          Issue New Prescription
        </h2>
        <p className="text-base text-on-surface-variant mt-2">
          Complete the form below to authorize medication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <Card className="card-glass p-6 gap-0">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">
              person_search
            </span>
            Patient Selection
          </h3>
          <div className="flex flex-col gap-2">
            <Label htmlFor="patient" className="label-uppercase">
              Patient
            </Label>
            <Select
              value={selectedUserId}
              onValueChange={(value) => setSelectedUserId(value ?? '')}
            >
              <SelectTrigger id="patient" className="w-full">
                <SelectValue placeholder="Select a patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="card-glass p-6 gap-0">
          <div className="flex justify-between items-end border-b border-outline-variant/50 pb-2 mb-6">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">vaccines</span>
              Medication Details
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
              <span className="material-symbols-outlined text-sm">add</span>
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <MedicationItemRow
                key={index}
                index={index}
                item={item}
                onChange={(field, value) => updateItem(index, field, value)}
                onRemove={() => handleRemoveItem(index)}
                canRemove={items.length > 1}
              />
            ))}
          </div>
        </Card>

        <Card className="card-glass p-6 gap-0">
          <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/50 pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">note_alt</span>
            Clinical Notes &amp; Authorization
          </h3>

          <div className="flex flex-col gap-2 mb-6">
            <Label htmlFor="notes" className="label-uppercase">
              Internal Notes (not printed on script)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add diagnosis codes or internal context..."
              rows={3}
            />
          </div>

          {error ? (
            <div
              role="alert"
              data-testid="form-error"
              className="mb-4 p-3 bg-error-container/10 border border-error rounded text-sm text-error flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/30">
            <Link
              href={routes.doctor.prescriptions}
              className={buttonVariants({ variant: 'outline' })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  {isResolvingPatient ? 'Resolving patient…' : 'Creating…'}
                </>
              ) : (
                'Issue Prescription'
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

interface MedicationItemRowProps {
  index: number
  item: PrescriptionItemDto
  onChange: (field: keyof PrescriptionItemDto, value: string | number | undefined) => void
  onRemove: () => void
  canRemove: boolean
}

function MedicationItemRow({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
}: MedicationItemRowProps) {
  const ids = {
    name: `med-name-${index}`,
    dosage: `med-dosage-${index}`,
    quantity: `med-quantity-${index}`,
    instructions: `med-instructions-${index}`,
  }
  return (
    <div
      data-testid="medication-item"
      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 relative group"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        disabled={!canRemove}
        className="absolute top-2 right-2"
        aria-label="Remove medication"
      >
        <span className="material-symbols-outlined">close</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 pr-8">
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <Label htmlFor={ids.name} className="label-uppercase">
            Medication name
          </Label>
          <Input
            id={ids.name}
            value={item.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., Amoxicillin"
            required
          />
        </div>
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <Label htmlFor={ids.dosage} className="label-uppercase">
            Dosage
          </Label>
          <Input
            id={ids.dosage}
            value={item.dosage || ''}
            onChange={(e) => onChange('dosage', e.target.value || undefined)}
            placeholder="e.g., 500mg"
          />
        </div>
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <Label htmlFor={ids.quantity} className="label-uppercase">
            Dispense quantity
          </Label>
          <Input
            id={ids.quantity}
            type="number"
            value={item.quantity ?? ''}
            onChange={(e) =>
              onChange('quantity', e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            placeholder="Qty"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={ids.instructions} className="label-uppercase">
          Patient instructions (SIG)
        </Label>
        <Input
          id={ids.instructions}
          value={item.instructions || ''}
          onChange={(e) => onChange('instructions', e.target.value || undefined)}
          placeholder="e.g., Take one tablet by mouth twice daily"
        />
      </div>
    </div>
  )
}
