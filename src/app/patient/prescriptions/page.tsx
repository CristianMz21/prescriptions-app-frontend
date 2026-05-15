import { PrescriptionCardList } from "@/components/prescription/PrescriptionCardList";

export default function PatientPrescriptionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-2 md:px-4">
      <div className="mb-8 md:mb-10 flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          My Prescriptions
        </h2>
        <p className="text-base text-on-surface-variant max-w-xl">
          Review your current medications, dosage instructions, and manage
          consumption records.
        </p>
      </div>
      <PrescriptionCardList />
    </div>
  );
}
