"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrescriptionCardList } from "@/components/prescription/PrescriptionCardList";
import { routes } from "@/lib/routes";
import { notify } from "@/lib/notifications";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PatientPrescriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("consumeError") !== "1") return;
    notify.error("Could not mark as consumed", "Please try again.");
    router.replace(routes.patient.prescriptions);
  }, [router, searchParams]);

  return (
    <PageShell>
      <PageHeader
        title="My Prescriptions"
        description="Review your current medications, dosage instructions, and manage consumption records."
      />
      <PrescriptionCardList />
    </PageShell>
  );
}
