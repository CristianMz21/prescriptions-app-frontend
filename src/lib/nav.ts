import type { Role } from "@/lib/api/generated/schemas";
import { routes } from "./routes";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const navigationByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: routes.admin.metrics, label: "Analytics", icon: "monitoring" },
    {
      href: routes.admin.prescriptions,
      label: "Prescriptions",
      icon: "medication",
    },
    { href: routes.admin.users, label: "Users", icon: "group" },
    { href: routes.admin.doctors, label: "Doctors", icon: "local_hospital" },
    { href: routes.admin.patients, label: "Patients", icon: "person" },
  ],
  DOCTOR: [
    {
      href: routes.doctor.prescriptions,
      label: "Prescriptions",
      icon: "medication",
    },
    {
      href: routes.doctor.newPrescription,
      label: "New Script",
      icon: "add_circle",
    },
    { href: routes.doctor.patients, label: "Patients", icon: "person" },
    { href: routes.doctor.analytics, label: "Analytics", icon: "monitoring" },
    { href: routes.doctor.profile, label: "Profile", icon: "account_circle" },
  ],
  PATIENT: [
    {
      href: routes.patient.prescriptions,
      label: "My Prescriptions",
      icon: "medication",
    },
    { href: routes.patient.profile, label: "Profile", icon: "account_circle" },
  ],
};
