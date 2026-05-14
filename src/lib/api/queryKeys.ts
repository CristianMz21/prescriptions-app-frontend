/**
 * Centralized React Query key factory.
 *
 * Wraps the Orval-generated `getXxxQueryKey` helpers so mutations can target
 * invalidations by domain ("all prescription lists") instead of by exact
 * params, and so a future schema change touches one file.
 *
 * Example:
 *   queryClient.invalidateQueries({ queryKey: qk.prescriptions.all })
 *   queryClient.invalidateQueries({ queryKey: qk.prescriptions.detail(id) })
 */
import {
  getAdminGetMetricsQueryKey,
  getAuthGetProfileQueryKey,
  getPrescriptionsFindAllQueryKey,
  getPrescriptionsFindOneQueryKey,
  getUsersFindAllDoctorsQueryKey,
  getUsersFindAllPatientsQueryKey,
  getUsersFindAllQueryKey,
  getUsersFindOneQueryKey,
} from './generated/prescriptionManagementAPI'
import type {
  AdminGetMetricsParams,
  PrescriptionsFindAllParams,
  UsersFindAllDoctorsParams,
  UsersFindAllParams,
  UsersFindAllPatientsParams,
} from './generated/schemas'

export const qk = {
  auth: {
    profile: () => getAuthGetProfileQueryKey(),
  },
  prescriptions: {
    all: ['/prescriptions'] as const,
    list: (params?: PrescriptionsFindAllParams) =>
      getPrescriptionsFindAllQueryKey(params),
    detail: (id: string) => getPrescriptionsFindOneQueryKey(id),
  },
  users: {
    all: (params?: UsersFindAllParams) =>
      getUsersFindAllQueryKey(params),
    patients: (params?: UsersFindAllPatientsParams) =>
      getUsersFindAllPatientsQueryKey(params),
    doctors: (params?: UsersFindAllDoctorsParams) =>
      getUsersFindAllDoctorsQueryKey(params),
    detail: (id: string) => getUsersFindOneQueryKey(id),
  },
  metrics: {
    summary: (params?: AdminGetMetricsParams) =>
      getAdminGetMetricsQueryKey(params),
  },
} as const
