"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrescriptionCardList } from "@/components/prescription/PrescriptionCardList";
import { routes } from "@/lib/routes";
import { notify } from "@/lib/notifications";

export default function PatientPrescriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("consumeError") !== "1") return;
    notify.error("Could not mark as consumed", "Please try again.");
    router.replace(routes.patient.prescriptions);
  }, [router, searchParams]);

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
