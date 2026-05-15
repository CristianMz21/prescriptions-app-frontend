import { requireRole } from "@/lib/auth/server";
import { AppShell } from "@/components/layouts/AppShell";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["PATIENT"]);
  return <AppShell role="PATIENT">{children}</AppShell>;
}
