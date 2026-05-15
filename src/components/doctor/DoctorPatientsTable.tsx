"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUsersFindAllPatients } from "@/lib/api/generated/prescriptionManagementAPI";
import type {
  UserEntity,
  UsersFindAllPatientsParams,
} from "@/lib/api/generated/schemas";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePagination } from "@/lib/hooks/usePagination";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { UrlSortableHeader } from "@/components/filters/SortableHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

const FILTER_KEYS = [
  "q",
  "birthDateFromDate",
  "birthDateToDate",
  "sortBy",
  "sortOrder",
] as const;

export function DoctorPatientsTable() {
  const { page, limit, setPage } = usePagination({ limit: 20 });
  const { values, setFilters, clear } =
    useUrlFilters<(typeof FILTER_KEYS)[number]>(FILTER_KEYS);

  const params: UsersFindAllPatientsParams = {
    page,
    limit,
    q: values.q,
    birthDateFromDate: values.birthDateFromDate,
    birthDateToDate: values.birthDateToDate,
    sortBy: values.sortBy as UsersFindAllPatientsParams["sortBy"] | undefined,
    sortOrder: values.sortOrder as
      | UsersFindAllPatientsParams["sortOrder"]
      | undefined,
  };

  const { data, isLoading, error } = useUsersFindAllPatients(params);

  const patients = (data?.data as UserEntity[] | undefined) ?? [];
  const meta = data?.meta;

  return (
    <PageShell>
      <PageHeader
        title="Patient Lookup"
        description="Find and view patient profiles by email or birth date."
      />

      <Card className="card-glass p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Search</Label>
            <Input
              type="search"
              placeholder="Email search"
              value={values.q ?? ""}
              onChange={(e) => setFilters({ q: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Birth Date From</Label>
            <Input
              type="date"
              value={values.birthDateFromDate ?? ""}
              onChange={(e) =>
                setFilters({ birthDateFromDate: e.target.value || undefined })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Search</Label>
            <Input
              type="search"
              placeholder="Name or email"
              value={values.q ?? ""}
              onChange={(e) => setFilters({ q: e.target.value || undefined })}
            />
          </div>
          ...
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Sort By</Label>
            <Select
              value={values.sortBy ?? "__NONE__"}
              onValueChange={(v) =>
                setFilters({
                  sortBy: v === "__NONE__" ? undefined : (v ?? undefined),
                  sortOrder:
                    v !== "__NONE__" ? (values.sortOrder ?? "asc") : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">— None —</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="label-uppercase">Order</Label>
            <div className="flex gap-1">
              {(["asc", "desc"] as const).map((o) => (
                <Button
                  key={o}
                  type="button"
                  variant={values.sortOrder === o ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilters({
                      sortOrder: values.sortOrder === o ? undefined : o,
                    })
                  }
                >
                  {o === "asc" ? "↑ Asc" : "↓ Desc"}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? <LoadingState label="Loading patients" /> : null}
      {error ? <ErrorState message={error.message} /> : null}

      {patients.length === 0 && !isLoading && !error ? (
        <EmptyState icon="userRound" title="No patients found" />
      ) : (
        <Card className="card-glass overflow-hidden p-0 gap-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
                <UrlSortableHeader sortBy="name">Patient</UrlSortableHeader>
                <TableCell className="label-uppercase tracking-widest text-[0.65rem] py-3">
                  Phone
                </TableCell>
                <TableHead className="uppercase tracking-wider text-xs">
                  Birth Date
                </TableHead>
                <UrlSortableHeader sortBy="createdAt">
                  Created
                </UrlSortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((u) => {
                const birthDate = u.patient?.birthDate;
                return (
                  <TableRow
                    key={u.id}
                    data-testid="patient-row"
                    className="hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20"
                  >
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">
                          {u.name}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">
                          {u.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-on-surface tabular-nums">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {birthDate
                        ? new Date(birthDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {meta ? (
            <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest/30">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Showing {patients.length} of {meta.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(meta.page - 1)}
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </Button>
                <div className="text-xs font-semibold tabular-nums">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage(meta.page + 1)}
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </PageShell>
  );
}
