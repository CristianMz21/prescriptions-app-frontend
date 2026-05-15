"use client";

import Link from "next/link";
import type {
  PrescriptionResponseDto,
  PrescriptionsFindAllParams,
  PrescriptionsFindAllStatus,
  UserEntity,
} from "@/lib/api/generated/schemas";
import {
  usePrescriptionsFindAll,
  useUsersFindAllPatients,
} from "@/lib/api/generated/prescriptionManagementAPI";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PrescriptionTableSkeleton } from "@/components/feedback/Skeletons";
import { PrescriptionTable } from "@/components/prescription/PrescriptionTable";
import {
  PrescriptionFiltersBar,
  type PrescriptionFilterValues,
} from "@/components/prescription/PrescriptionFiltersBar";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { usePagination } from "@/lib/hooks/usePagination";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { useMemo } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

const FILTER_KEYS = [
  "status",
  "fromDate",
  "toDate",
  "q",
  "sortBy",
  "sortOrder",
  "hasNotes",
] as const;

export function DoctorPrescriptionList() {
  const { page, limit, setPage } = usePagination({ limit: 10 });
  const { values, setFilters, clear } =
    useUrlFilters<(typeof FILTER_KEYS)[number]>(FILTER_KEYS);

  const params: PrescriptionsFindAllParams = {
    page,
    limit,
    status: values.status as PrescriptionsFindAllStatus | undefined,
    fromDate: values.fromDate,
    toDate: values.toDate,
    q: values.q,
    sortBy: values.sortBy as PrescriptionsFindAllParams["sortBy"] | undefined,
    sortOrder: values.sortOrder as
      | PrescriptionsFindAllParams["sortOrder"]
      | undefined,
    hasNotes:
      values.hasNotes === "true"
        ? true
        : values.hasNotes === "false"
          ? false
          : undefined,
  };
  const { data, isLoading, error, refetch } = usePrescriptionsFindAll(params);
  const { data: patientsData } = useUsersFindAllPatients({
    page: 1,
    limit: 100,
  });
  const patientNameByEmail = useMemo(() => {
    const entries: Array<[string, string]> =
      (patientsData?.data as UserEntity[] | undefined)?.map((patient) => [
        patient.email.toLowerCase(),
        patient.name,
      ]) ?? [];
    return new Map(entries);
  }, [patientsData?.data]);

  return (
    <PageShell className="space-y-5">
      <PageHeader
        title="Active Prescriptions"
        description="Manage and monitor pending and active scripts."
        actions={
          <Link
            href={routes.doctor.newPrescription}
            className={buttonVariants()}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Prescription
          </Link>
        }
      />

      <PrescriptionFiltersBar
        values={values}
        onChange={(patch: Partial<PrescriptionFilterValues>) =>
          setFilters(
            patch as Partial<
              Record<(typeof FILTER_KEYS)[number], string | undefined>
            >,
          )
        }
        onClear={clear}
        role="DOCTOR"
      />

      {isLoading ? <PrescriptionTableSkeleton /> : null}
      {error ? (
        <ErrorState
          message={error.message}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          }
        />
      ) : null}
      {!isLoading && !error
        ? (() => {
            const prescriptions =
              (data?.data as PrescriptionResponseDto[] | undefined) ?? [];
            if (prescriptions.length === 0) {
              return <EmptyState icon="pill" title="No prescriptions found" />;
            }
            return (
              <PrescriptionTable
                prescriptions={prescriptions}
                getDetailHref={routes.doctor.detail}
                meta={data?.meta}
                onPageChange={setPage}
                patientNameByEmail={patientNameByEmail}
              />
            );
          })()
        : null}
    </PageShell>
  );
}
