import { requireRole } from "@/lib/auth/server";
import { ProfileCard } from "@/components/account/ProfileCard";

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
    <div className="mx-auto max-w-6xl px-3 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="mb-6 md:mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          My Profile
        </h2>
        <p className="text-base text-on-surface-variant mt-2">
          Practitioner record on file with the clinic.
        </p>
      </div>
      <ProfileCard user={user} extras={extras} />
    </div>
  );
}
