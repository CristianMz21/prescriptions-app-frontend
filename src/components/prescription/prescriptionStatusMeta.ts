import type { PrescriptionStatus } from '@/lib/api/generated/schemas'

export interface PrescriptionStatusMeta {
  icon: string
  label: string
  filled: boolean
  tone: string
}

export const STATUS_META: Record<PrescriptionStatus, PrescriptionStatusMeta> = {
  PENDING: {
    icon: 'pending_actions',
    label: 'Pending',
    filled: false,
    tone: 'text-on-surface-variant border-outline-variant',
  },
  CONSUMED: {
    icon: 'check_circle',
    label: 'Consumed',
    filled: true,
    tone: 'text-primary border-outline-variant/50',
  },
}
