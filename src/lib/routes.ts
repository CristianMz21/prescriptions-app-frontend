import type { Role } from "@/lib/api/generated/schemas";

export const routes = {
  login: "/login",
  admin: {
    metrics: "/admin/metrics",
    users: "/admin/users",
    newUser: "/admin/users/new",
    doctors: "/admin/doctors",
    patients: "/admin/patients",
    prescriptions: "/admin/prescriptions",
  },
  doctor: {
    prescriptions: "/doctor/prescriptions",
    newPrescription: "/doctor/prescriptions/new",
    patients: "/doctor/patients",
    profile: "/doctor/profile",
    analytics: "/doctor/analytics",
  },
  patient: {
    prescriptions: "/patient/prescriptions",
    detail: (id: string) => `/patient/prescriptions/${id}`,
    consume: (id: string) => `/patient/prescriptions/${id}/consume`,
    profile: "/patient/profile",
  },
} as const;

export function getRedirectPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return routes.admin.metrics;
    case "DOCTOR":
      return routes.doctor.prescriptions;
    case "PATIENT":
      return routes.patient.prescriptions;
    default:
      return routes.login;
  }
}
