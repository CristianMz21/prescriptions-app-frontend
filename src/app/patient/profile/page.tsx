import { requireRole } from "@/lib/auth/server";
import { ProfileCard } from "@/components/account/ProfileCard";

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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          My Profile
        </h2>
        <p className="text-base text-on-surface-variant mt-2">
          Read-only view of the account the clinic has on file.
        </p>
      </div>
      <ProfileCard user={user} extras={extras} />
    </div>
  );
}
