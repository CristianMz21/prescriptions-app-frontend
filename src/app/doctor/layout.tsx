import { requireRole } from "@/lib/auth/server";
import { AppShell } from "@/components/layouts/AppShell";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["DOCTOR"]);
  return <AppShell role="DOCTOR">{children}</AppShell>;
}
