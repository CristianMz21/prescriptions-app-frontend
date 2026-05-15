"use client";

import Link from "next/link";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { PrescriptionStatusBadge } from "./PrescriptionStatusBadge";
import {
  getPrescriptionExpiry,
  getUserDisplayName,
} from "@/lib/prescription-ui";
import { DataTableShell } from "@/components/shared/DataTableShell";
import { formatDate } from "@/lib/utils";

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface PrescriptionTableProps {
  prescriptions: PrescriptionResponseDto[];
  getDetailHref: (id: string) => string;
  meta?: Pagination;
  onPageChange?: (page: number) => void;
  patientNameByEmail?: Map<string, string>;
}

export function PrescriptionTable({
  prescriptions,
  getDetailHref,
  meta,
  onPageChange,
  patientNameByEmail,
}: PrescriptionTableProps) {
  const now = new Date();

  return (
    <DataTableShell className="shadow-lg">
      <div className="px-3 pb-3 md:px-3 md:pb-2">
        <div className="space-y-3 md:hidden">
          {prescriptions.map((rx) => {
            const expiryDate = getPrescriptionExpiry(rx);
            const isExpired =
              rx.status === "PENDING" &&
              expiryDate &&
              new Date(expiryDate) < now;
            const expiryDateStr = expiryDate ? formatDate(expiryDate) : "—";
            const createdDateStr = formatDate(rx.createdAt);

            const patientName =
              patientNameByEmail?.get(
                (rx.patient?.user?.email ?? "").toLowerCase(),
              ) ??
              getUserDisplayName(
                rx.patient?.user as { email?: string; name?: string },
              );

            return (
              // Mobile-only card variant. Uses a distinct testid so E2E tests
              // running at desktop viewports (default 1280×800) target the
              // visible <TableRow> below rather than this `md:hidden` element
              // — sharing `prescription-row` made `.first()` resolve to a
              // hidden node and every doctor.spec.ts row-click test timed out.
              <article
                key={rx.id}
                data-testid="prescription-row-mobile"
                data-rx-code={rx.code}
                className={`rounded-lg border border-outline-variant/40 bg-surface-container-lowest/40 p-3 ${
                  isExpired ? "border-error/50" : ""
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {patientName}
                    </p>
                    <p className="truncate font-mono text-xs text-on-surface-variant">
                      {rx.patient?.user?.email || "N/A"}
                    </p>
                  </div>
                  <PrescriptionStatusBadge status={rx.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="uppercase tracking-wider text-on-surface-variant">
                      RX
                    </p>
                    <p className="truncate font-mono text-on-surface">
                      {rx.code}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-on-surface-variant">
                      Date
                    </p>
                    <p className="tabular-nums text-on-surface">
                      {createdDateStr}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="uppercase tracking-wider text-on-surface-variant">
                      Medication
                    </p>
                    <p className="line-clamp-2 text-on-surface">
                      {rx.items?.map((item) => item.name).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-on-surface-variant">
                      Expiry
                    </p>
                    <p
                      className={`tabular-nums ${isExpired ? "font-semibold text-error" : "text-on-surface"}`}
                    >
                      {expiryDateStr}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    href={getDetailHref(rx.id)}
                    aria-label={`View ${rx.code}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "w-full min-h-11",
                    })}
                  >
                    <span className="material-symbols-outlined text-base">
                      visibility
                    </span>
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="border-b border-outline-variant/30 bg-surface-container-lowest/50">
                <TableHead className="uppercase tracking-wider text-xs w-[22%]">
                  Name
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs hidden xl:table-cell xl:w-[18%]">
                  Patient
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs hidden lg:table-cell lg:w-[14%]">
                  RX Code
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs w-[28%] lg:w-[24%] xl:w-[18%]">
                  Medications
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs w-[16%] lg:w-[14%] xl:w-[12%]">
                  Status
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs hidden lg:table-cell lg:w-[12%] xl:w-[10%]">
                  Expiry
                </TableHead>
                <TableHead className="uppercase tracking-wider text-xs hidden xl:table-cell xl:w-[10%]">
                  Date
                </TableHead>
                <TableHead className="text-right uppercase tracking-wider text-xs w-[64px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx, index) => {
                const expiryDate = getPrescriptionExpiry(rx);
                const isExpired =
                  rx.status === "PENDING" &&
                  expiryDate &&
                  new Date(expiryDate) < now;
                const expiryDateStr = expiryDate ? formatDate(expiryDate) : "—";
                const createdDateStr = formatDate(rx.createdAt);
                const patientEmail = rx.patient?.user?.email || "N/A";
                const patientName =
                  patientNameByEmail?.get(
                    (rx.patient?.user?.email ?? "").toLowerCase(),
                  ) ??
                  getUserDisplayName(
                    rx.patient?.user as { email?: string; name?: string },
                  );

                return (
                  <TableRow
                    key={rx.id}
                    data-testid="prescription-row"
                    data-rx-code={rx.code}
                    className={`hover:bg-surface-variant/20 transition-colors border-b border-outline-variant/20 ${
                      index % 2 === 0 ? "bg-surface/20" : ""
                    } ${isExpired ? "bg-error/5" : ""}`}
                  >
                    <TableCell className="text-sm font-semibold text-primary py-3.5">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate" title={patientName}>
                          {patientName}
                        </span>
                        {/* Below xl, surface the email here since the
                            Patient column is hidden. */}
                        <span
                          className="truncate font-mono text-xs font-normal text-on-surface-variant xl:hidden"
                          title={patientEmail}
                        >
                          {patientEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm py-3.5 hidden xl:table-cell">
                      <span
                        className="block truncate font-mono text-on-surface"
                        title={patientEmail}
                      >
                        {patientEmail}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-on-surface py-3.5 hidden lg:table-cell">
                      <span className="block truncate" title={rx.code}>
                        {rx.code}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-on-surface py-3.5">
                      <div
                        className="line-clamp-2 break-words"
                        title={
                          rx.items
                            ?.map(
                              (item) =>
                                `${item.name}${item.quantity ? ` (${item.quantity})` : ""}`,
                            )
                            .join(", ") || "N/A"
                        }
                      >
                        {rx.items?.map((item, i) => (
                          <span key={item.id}>
                            {i > 0 ? ", " : ""}
                            {item.name}
                            {item.quantity ? ` (${item.quantity})` : ""}
                          </span>
                        )) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <PrescriptionStatusBadge status={rx.status} />
                        {isExpired && (
                          <span className="text-[0.6rem] font-bold text-error uppercase tracking-widest">
                            Expired
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-sm tabular-nums py-3.5 hidden lg:table-cell ${isExpired ? "text-error font-semibold" : "text-on-surface-variant"}`}
                    >
                      {expiryDateStr}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-on-surface-variant py-3.5 hidden xl:table-cell">
                      {createdDateStr}
                    </TableCell>
                    <TableCell className="text-right py-3.5 pr-3">
                      <Link
                        href={getDetailHref(rx.id)}
                        aria-label={`View ${rx.code}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                        })}
                      >
                        <span className="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta ? (
        <div className="border-t border-outline-variant/30 bg-surface-container-lowest/30 px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Showing {prescriptions.length} of {meta.total}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={meta.page <= 1 || !onPageChange}
                onClick={() => onPageChange?.(meta.page - 1)}
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
                disabled={meta.page >= meta.totalPages || !onPageChange}
                onClick={() => onPageChange?.(meta.page + 1)}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DataTableShell>
  );
}
