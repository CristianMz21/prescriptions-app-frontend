"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePrescriptionsFindAll } from "@/lib/api/generated/prescriptionManagementAPI";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { MetricCard } from "@/components/admin/MetricCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MetricCardsSkeleton } from "@/components/feedback/Skeletons";
import { isDoctorAnalyticsEnabled } from "@/lib/features";
import { routes } from "@/lib/routes";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

export default function DoctorAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const enabled = isDoctorAnalyticsEnabled();

  useEffect(() => {
    if (!enabled) {
      router.replace(routes.doctor.prescriptions);
    }
  }, [enabled, router]);

  // The backend already scopes /prescriptions to the calling doctor; we
  // aggregate locally to compute per-doctor stats without admin metrics.
  const { data, isLoading, error } = usePrescriptionsFindAll(
    { limit: 100 },
    { query: { enabled } },
  );

  if (!enabled) return null;

  return (
    <PageShell>
      <PageHeader
        title="My Activity"
        description={`Activity scoped to ${user?.email ?? "you"} — last 100 issued scripts.`}
      />

      {isLoading ? <MetricCardsSkeleton /> : null}
      {error ? <ErrorState message={error.message} /> : null}
      {!isLoading && !error
        ? (() => {
            const list =
              (data?.data as PrescriptionResponseDto[] | undefined) ?? [];
            const total = list.length;
            const consumed = list.filter((p) => p.status === "CONSUMED").length;
            const pending = total - consumed;
            const consumedPct =
              total > 0 ? Math.round((consumed / total) * 100) : 0;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard label="Issued (recent)" value={total} icon="pill" />
                <MetricCard
                  label="Pending"
                  value={pending}
                  icon="clipboardList"
                />
                <MetricCard
                  label="Consumed"
                  value={consumed}
                  icon="checkCircle2"
                />
                <MetricCard
                  label="Consumed rate"
                  value={`${consumedPct}%`}
                  icon="activity"
                />
              </div>
            );
          })()
        : null}
    </PageShell>
  );
}
