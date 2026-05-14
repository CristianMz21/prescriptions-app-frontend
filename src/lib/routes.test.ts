import { describe, expect, it } from 'vitest'
import { getRedirectPath, routes } from './routes'

describe('routes', () => {
  it('builds parameterized patient routes', () => {
    expect(routes.patient.detail('abc-123')).toBe('/patient/prescriptions/abc-123')
    expect(routes.patient.consume('abc-123')).toBe(
      '/patient/prescriptions/abc-123/consume',
    )
  })
})

describe('getRedirectPath', () => {
  it('routes ADMIN to metrics', () => {
    expect(getRedirectPath('ADMIN')).toBe(routes.admin.metrics)
  })
  it('routes DOCTOR to prescriptions list', () => {
    expect(getRedirectPath('DOCTOR')).toBe(routes.doctor.prescriptions)
  })
  it('routes PATIENT to prescriptions list', () => {
    expect(getRedirectPath('PATIENT')).toBe(routes.patient.prescriptions)
  })
})
