import type { Role } from '@/lib/api/generated/schemas'
import { routes } from './routes'

export interface NavItem {
  href: string
  label: string
  icon: string
}

export const navigationByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: routes.admin.metrics, label: 'Analytics', icon: 'monitoring' },
  ],
  DOCTOR: [
    { href: routes.doctor.prescriptions, label: 'Prescriptions', icon: 'medication' },
    { href: routes.doctor.newPrescription, label: 'New Script', icon: 'add_circle' },
  ],
  PATIENT: [
    { href: routes.patient.prescriptions, label: 'My Prescriptions', icon: 'medication' },
  ],
}
