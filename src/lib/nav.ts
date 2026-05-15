import type { Role } from "@/lib/api/generated/schemas";
import { routes } from "./routes";
import { isDoctorAnalyticsEnabled } from "./features";
import type { AppIconName } from "@/config/icon-registry";

export interface NavItem {
  href: string;
  label: string;
  icon: AppIconName;
}

export const navigationByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: routes.admin.metrics, label: "Analytics", icon: "barChart3" },
    {
      href: routes.admin.prescriptions,
      label: "Prescriptions",
      icon: "pill",
    },
    { href: routes.admin.users, label: "Users", icon: "users" },
    { href: routes.admin.doctors, label: "Doctors", icon: "hospital" },
    { href: routes.admin.patients, label: "Patients", icon: "userRound" },
  ],
  DOCTOR: [
    {
      href: routes.doctor.prescriptions,
      label: "Prescriptions",
      icon: "pill",
    },
    {
      href: routes.doctor.newPrescription,
      label: "New Script",
      icon: "circlePlus",
    },
    { href: routes.doctor.patients, label: "Patients", icon: "userRound" },
    ...(isDoctorAnalyticsEnabled()
      ? [
          {
            href: routes.doctor.analytics,
            label: "Analytics",
            icon: "barChart3",
          },
        ]
      : []),
    { href: routes.doctor.profile, label: "Profile", icon: "userCircle2" },
  ],
  PATIENT: [
    {
      href: routes.patient.prescriptions,
      label: "My Prescriptions",
      icon: "pill",
    },
    { href: routes.patient.profile, label: "Profile", icon: "userCircle2" },
  ],
};
