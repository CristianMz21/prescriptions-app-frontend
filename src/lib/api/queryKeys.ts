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
  getAdminControllerGetMetricsQueryKey,
  getAuthControllerGetProfileQueryKey,
  getPrescriptionsControllerFindAllQueryKey,
  getPrescriptionsControllerFindOneQueryKey,
  getUsersControllerFindAllDoctorsQueryKey,
  getUsersControllerFindAllPatientsQueryKey,
  getUsersControllerFindAllQueryKey,
  getUsersControllerFindOneQueryKey,
} from './generated/prescriptionManagementAPI'
import type {
  AdminControllerGetMetricsParams,
  PrescriptionsControllerFindAllParams,
  UsersControllerFindAllDoctorsParams,
  UsersControllerFindAllParams,
  UsersControllerFindAllPatientsParams,
} from './generated/schemas'

export const qk = {
  auth: {
    profile: () => getAuthControllerGetProfileQueryKey(),
  },
  prescriptions: {
    all: ['/prescriptions'] as const,
    list: (params?: PrescriptionsControllerFindAllParams) =>
      getPrescriptionsControllerFindAllQueryKey(params),
    detail: (id: string) => getPrescriptionsControllerFindOneQueryKey(id),
  },
  users: {
    all: (params?: UsersControllerFindAllParams) =>
      getUsersControllerFindAllQueryKey(params),
    patients: (params?: UsersControllerFindAllPatientsParams) =>
      getUsersControllerFindAllPatientsQueryKey(params),
    doctors: (params?: UsersControllerFindAllDoctorsParams) =>
      getUsersControllerFindAllDoctorsQueryKey(params),
    detail: (id: string) => getUsersControllerFindOneQueryKey(id),
  },
  metrics: {
    summary: (params?: AdminControllerGetMetricsParams) =>
      getAdminControllerGetMetricsQueryKey(params),
  },
} as const
