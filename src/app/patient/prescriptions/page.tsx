import { PrescriptionCardList } from '@/components/prescription/PrescriptionCardList'

export default function PatientPrescriptionsPage() {
  return (
    <>
      <div className="mb-12 flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">My Prescriptions</h2>
        <p className="text-base text-on-surface-variant max-w-xl">
          Review your current medications, dosage instructions, and manage consumption records.
        </p>
      </div>
      <PrescriptionCardList />
    </>
  )
}
