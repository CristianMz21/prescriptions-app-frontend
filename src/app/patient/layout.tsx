import { headers } from "next/headers";
import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layouts/AppShell";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TEMP DIAGNOSTIC: log auth state at layout-render time so we can see
  // why the consume redirect target bounces to /login. Inline the
  // getAuth + redirect call so we can log the outcome.
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie") ?? "(none)";
  const masked = cookieHeader.replace(
    /=([^;]+)/g,
    (_, v) => `=<${v.length}b>`,
  );
  const pathname = reqHeaders.get("x-pathname") ?? "(unknown)";
  console.error(
    `[patient-layout] render path=${pathname} cookies=${masked}`,
  );
  const auth = await getAuth();
  console.error(
    `[patient-layout] getAuth result: ${
      auth ? `role=${auth.role} id=${auth.id}` : "null"
    }`,
  );
  if (!auth) {
    redirect("/login");
  }
  if (auth.role !== "PATIENT") {
    redirect("/login");
  }
  return <AppShell role="PATIENT">{children}</AppShell>;
}
