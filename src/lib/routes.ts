import type { Role } from '@/lib/api/generated/schemas'

export const routes = {
  login: '/login',
  admin: {
    metrics: '/admin/metrics',
  },
  doctor: {
    prescriptions: '/doctor/prescriptions',
    newPrescription: '/doctor/prescriptions/new',
  },
  patient: {
    prescriptions: '/patient/prescriptions',
    detail: (id: string) => `/patient/prescriptions/${id}`,
    consume: (id: string) => `/patient/prescriptions/${id}/consume`,
  },
} as const

export function getRedirectPath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return routes.admin.metrics
    case 'DOCTOR':
      return routes.doctor.prescriptions
    case 'PATIENT':
      return routes.patient.prescriptions
    default:
      return routes.login
  }
}
