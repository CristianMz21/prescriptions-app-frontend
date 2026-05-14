import { requireRole } from "@/lib/auth/server";
import { AppShell } from "@/components/layouts/AppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"]);
  return <AppShell role="ADMIN">{children}</AppShell>;
}
