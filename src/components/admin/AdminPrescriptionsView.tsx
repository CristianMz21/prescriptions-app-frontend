"use client";

import { useAdminListPrescriptions } from "@/lib/api/generated/prescriptionManagementAPI";
import type {
  AdminListPrescriptionsParams,
  PrescriptionResponseDto,
  PrescriptionStatus,
} from "@/lib/api/generated/schemas";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PrescriptionTable } from "@/components/prescription/PrescriptionTable";
import {
  PrescriptionFiltersBar,
  type PrescriptionFilterValues,
} from "@/components/prescription/PrescriptionFiltersBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { routes } from "@/lib/routes";
import { useLegacyUrlMigration } from "@/lib/hooks/useLegacyUrlMigration";
import { Button } from "@/components/ui/button";

const FILTER_KEYS = [
  "status",
  "fromDate",
  "toDate",
  "q",
  "sortBy",
  "sortOrder",
  "hasNotes",
  "code",
  "consumedFromDate",
  "consumedToDate",
  "patientEmail",
  "doctorEmail",
] as const;

export function AdminPrescriptionsView() {
  useLegacyUrlMigration();
  const { page, limit, setPage } = usePagination({ limit: 10 });
  const { values, setFilters, clear } =
    useUrlFilters<(typeof FILTER_KEYS)[number]>(FILTER_KEYS);

  const params: AdminListPrescriptionsParams = {
    page,
    limit,
    status: values.status as PrescriptionStatus | undefined,
    fromDate: values.fromDate,
    toDate: values.toDate,
    code: values.code,
    sortBy: values.sortBy as AdminListPrescriptionsParams["sortBy"] | undefined,
    sortOrder: values.sortOrder as
      | AdminListPrescriptionsParams["sortOrder"]
      | undefined,
    hasNotes:
      values.hasNotes === "true"
        ? true
        : values.hasNotes === "false"
          ? false
          : undefined,
    consumedFromDate: values.consumedFromDate,
    consumedToDate: values.consumedToDate,
    patientEmail: values.patientEmail,
    doctorEmail: values.doctorEmail,
    q: values.q,
  };
  const { data, isLoading, error, refetch } = useAdminListPrescriptions(params);

  const handleChange = (patch: Partial<PrescriptionFilterValues>) => {
    setFilters(
      patch as Partial<
        Record<(typeof FILTER_KEYS)[number], string | undefined>
      >,
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary">All Prescriptions</h2>
        <p className="text-base text-on-surface-variant mt-1">
          Read-only audit view across every doctor and patient.
        </p>
      </div>

      <PrescriptionFiltersBar
        values={values}
        onChange={handleChange}
        onClear={clear}
        role="ADMIN"
      />

      {isLoading ? <LoadingState label="Loading prescriptions" /> : null}
      {error ? (
        <ErrorState
          message={error.message}
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
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
              return (
                <EmptyState
                  icon="pill"
                  title="No prescriptions match these filters"
                />
              );
            }
            return (
              <PrescriptionTable
                prescriptions={prescriptions}
                getDetailHref={(id) => `${routes.admin.prescriptions}/${id}`}
                meta={data?.meta}
                onPageChange={setPage}
              />
            );
          })()
        : null}
    </div>
  );
}
