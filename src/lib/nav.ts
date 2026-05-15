import type { Role } from "@/lib/api/generated/schemas";
import { routes } from "./routes";
import { isDoctorAnalyticsEnabled } from "./features";
import type { AppIconName } from "@/config/icon-registry";

export interface NavItem {
  href: string;
  label: string;
  icon: AppIconName;
}

const navItem = (href: string, label: string, icon: AppIconName): NavItem => ({
  href,
  label,
  icon,
});

export const navigationByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    navItem(routes.admin.metrics, "Analytics", "barChart3"),
    navItem(routes.admin.prescriptions, "Prescriptions", "pill"),
    navItem(routes.admin.users, "Users", "users"),
    navItem(routes.admin.doctors, "Doctors", "hospital"),
    navItem(routes.admin.patients, "Patients", "userRound"),
  ],
  DOCTOR: [
    navItem(routes.doctor.prescriptions, "Prescriptions", "pill"),
    navItem(routes.doctor.newPrescription, "New Script", "circlePlus"),
    navItem(routes.doctor.patients, "Patients", "userRound"),
    ...(isDoctorAnalyticsEnabled()
      ? [navItem(routes.doctor.analytics, "Analytics", "barChart3")]
      : []),
    navItem(routes.doctor.profile, "Profile", "userCircle2"),
  ],
  PATIENT: [
    navItem(routes.patient.prescriptions, "My Prescriptions", "pill"),
    navItem(routes.patient.profile, "Profile", "userCircle2"),
  ],
};
