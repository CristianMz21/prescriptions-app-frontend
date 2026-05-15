"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PrescriptionResponseDto } from "@/lib/api/generated/schemas";
import { usePrescriptionsFindAll } from "@/lib/api/generated/prescriptionManagementAPI";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PrescriptionCardListSkeleton } from "@/components/feedback/Skeletons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";
import { PrescriptionCard } from "./PrescriptionCard";
import { PdfDownloadButton } from "./PdfDownloadButton";
import { ConsumePrescriptionButton } from "./ConsumePrescriptionButton";
import { AppIcon } from "@/components/icons/AppIcon";

export function PrescriptionCardList() {
  const { data, isLoading, error, refetch } = usePrescriptionsFindAll();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "CONSUMED"
  >("ALL");

  const prescriptions = useMemo(
    () => (data?.data as PrescriptionResponseDto[] | undefined) ?? [],
    [data?.data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prescriptions.filter((rx) => {
      if (statusFilter !== "ALL" && rx.status !== statusFilter) return false;
      if (!q) return true;
      const medMatches = rx.items?.some((item) =>
        `${item.name} ${item.dosage ?? ""}`.toLowerCase().includes(q),
      );
      return (
        rx.code.toLowerCase().includes(q) ||
        (rx.notes ?? "").toLowerCase().includes(q) ||
        medMatches
      );
    });
  }, [prescriptions, query, statusFilter]);

  const pendingCount = prescriptions.filter(
    (p) => p.status === "PENDING",
  ).length;
  const consumedCount = prescriptions.filter(
    (p) => p.status === "CONSUMED",
  ).length;

  if (isLoading) return <PrescriptionCardListSkeleton />;
  if (error)
    return (
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
    );

  if (prescriptions.length === 0) {
    return <EmptyState icon="pill" title="No prescriptions found" />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="card-glass rounded-2xl border border-outline-variant/30 p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by RX code, medication, or notes"
            className="md:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "ALL" ? "default" : "outline"}
              onClick={() => setStatusFilter("ALL")}
            >
              All ({prescriptions.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "CONSUMED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CONSUMED")}
            >
              Consumed ({consumedCount})
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="pill" title="No prescriptions match your filters" />
      ) : null}

      {filtered.map((rx) => (
        <PrescriptionCard
          key={rx.id}
          prescription={rx}
          actions={
            <>
              <Link
                href={routes.patient.detail(rx.id)}
                className={buttonVariants({ variant: "outline" })}
              >
                <AppIcon name="eye" size="sm" />
                View Details
              </Link>
              <PdfDownloadButton prescriptionId={rx.id} />
              {rx.status === "PENDING" ? (
                <ConsumePrescriptionButton prescriptionId={rx.id} />
              ) : null}
            </>
          }
        />
      ))}
    </div>
  );
}
