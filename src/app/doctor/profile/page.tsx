import { requireRole } from "@/lib/auth/server";
import { ProfileCard } from "@/components/account/ProfileCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageShell } from "@/components/shared/PageShell";

function asDisplayString(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  return String(value);
}

export default async function DoctorProfilePage() {
  const user = await requireRole(["DOCTOR"]);
  const doctor = user.doctor;

  const extras = doctor
    ? [
        { label: "Specialty", value: asDisplayString(doctor.specialty) },
        { label: "Medical ID", value: asDisplayString(doctor.medicalId) },
        {
          label: "Signature label",
          value: asDisplayString(doctor.signatureText),
        },
      ]
    : [];

  return (
    <PageShell>
      <PageHeader
        title="My Profile"
        description="Practitioner record on file with the clinic."
      />
      <ProfileCard user={user} extras={extras} />
    </PageShell>
  );
}
