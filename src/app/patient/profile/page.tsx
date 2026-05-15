import { requireRole } from "@/lib/auth/server";
import { ProfileCard } from "@/components/account/ProfileCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageShell } from "@/components/shared/PageShell";

export default async function PatientProfilePage() {
  const user = await requireRole(["PATIENT"]);

  const extras = [];
  const birthDate = user.patient?.birthDate as unknown;
  if (typeof birthDate === "string" && birthDate.length > 0) {
    extras.push({
      label: "Date of birth",
      value: new Date(birthDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  return (
    <PageShell>
      <PageHeader
        title="My Profile"
        description="Read-only view of the account the clinic has on file."
      />
      <ProfileCard user={user} extras={extras} />
    </PageShell>
  );
}
